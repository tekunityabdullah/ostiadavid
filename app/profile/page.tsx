import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem, Profile } from "@/lib/types";
import ProfileActions from "./ProfileActions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedOrders = (orders ?? []) as Order[];

  const orderIds = typedOrders.map((o) => o.id);
  let orderItemsMap: Record<string, OrderItem[]> = {};

  if (orderIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    orderItemsMap = ((orderItems ?? []) as OrderItem[]).reduce(
      (acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      },
      {} as Record<string, OrderItem[]>
    );
  }

  const joinedDate = typedProfile?.created_at
    ? new Date(typedProfile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wide text-white mb-8 text-center">
            My Account
          </h1>

          <div className="w-full md:px-[60px] flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
              <div className="border border-white/20 p-6 flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                  <span className="text-2xl uppercase text-white/30">
                    {(typedProfile?.full_name || user.email || "?")[0]}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-base md:text-lg uppercase tracking-tight font-medium text-white">
                    {typedProfile?.full_name || "Member"}
                  </div>
                  <div className="text-xs text-white/50 mt-1">{user.email}</div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase tracking-tight">
                    Member since {joinedDate}
                  </div>
                  <div
                    className={`mt-3 text-[10px] uppercase tracking-[0.15em] px-3 py-1 inline-block ${
                      typedProfile?.account_type === "exclusive"
                        ? "bg-white text-black"
                        : "border border-white/30 text-white/60"
                    }`}
                  >
                    {typedProfile?.account_type === "exclusive"
                      ? "Exclusive Member"
                      : "Regular Member"}
                  </div>
                </div>

                {typedProfile?.account_type !== "exclusive" && (
                  <Link
                    href="/signup/exclusive"
                    className="w-full text-center px-6 py-2 text-xs uppercase tracking-tight font-medium text-black bg-white no-underline transition-colors hover:bg-[#e5e5e5]"
                  >
                    Upgrade to Exclusive
                  </Link>
                )}

                <ProfileActions />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="border border-white/20 p-6 flex flex-col gap-4">
                <h2 className="text-sm uppercase tracking-tight font-medium text-white">
                  Order History
                </h2>

                {typedOrders.length === 0 ? (
                  <p className="text-xs text-white/40 uppercase tracking-tight">
                    No orders yet
                  </p>
                ) : (
                  typedOrders.map((order) => {
                    const items = orderItemsMap[order.id] ?? [];
                    const itemNames = items
                      .map((i) => `${i.product_name} ×${i.quantity}`)
                      .join(", ");

                    return (
                      <div
                        key={order.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-tight font-medium text-white">
                              {order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] uppercase tracking-tight px-2 py-0.5 bg-white/10 text-white/70">
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-white/40">
                            {new Date(order.created_at).toLocaleDateString()} ·{" "}
                            {itemNames}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-white">
                          {formatPrice(Number(order.total))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
