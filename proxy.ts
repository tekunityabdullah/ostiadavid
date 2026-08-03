import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isExclusiveRoute =
    pathname.startsWith("/exclusive") || pathname.startsWith("/unreleased");
  const isAdminRoute =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/api/admin");

  if (isExclusiveRoute || isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isApiRoute = pathname.startsWith("/api/");

    if (!user) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginPath = isAdminRoute ? "/admin/login" : "/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (isExclusiveRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      if (profile?.account_type !== "exclusive") {
        return NextResponse.redirect(new URL("/signup/exclusive", request.url));
      }
    }

    if (isAdminRoute) {
      // Admin status lives in its own `admins` table, separate from the
      // customer-facing `profiles` table.
      const { data: admin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!admin) {
        if (isApiRoute) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
