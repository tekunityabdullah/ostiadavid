import { redirect } from "next/navigation";
import Header from "../components/Header";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";
import DownloadButton from "./DownloadButton";

interface ProfilePageProps {
  searchParams: Promise<{ scope?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { scope } = await searchParams;
  const isExclusiveScope = scope === "exclusive";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedOrders = (orders ?? []) as Order[];

  const orderIds = typedOrders.map((o) => o.id);
  let orderItemsMap: Record<string, OrderItem[]> = {};
  let digitalItems: OrderItem[] = [];
  let exclusiveOrderIds = new Set<string>();

  if (orderIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    const typedOrderItems = (orderItems ?? []) as OrderItem[];

    orderItemsMap = typedOrderItems.reduce(
      (acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      },
      {} as Record<string, OrderItem[]>
    );

    const productIds = [
      ...new Set(typedOrderItems.map((i) => i.product_id).filter(Boolean)),
    ] as string[];

    if (productIds.length > 0) {
      const { data: productFlags } = await supabase
        .from("products")
        .select("id, is_digital, is_exclusive")
        .in("id", productIds);

      const digitalProductIds = new Set(
        (productFlags ?? []).filter((p) => p.is_digital).map((p) => p.id)
      );
      const exclusiveProductIds = new Set(
        (productFlags ?? []).filter((p) => p.is_exclusive).map((p) => p.id)
      );

      digitalItems = typedOrderItems.filter(
        (i) => i.product_id && digitalProductIds.has(i.product_id)
      );

      // An order counts as "Exclusive" if any line in it is an exclusive
      // product — matches how the Exclusive account menu's "See Orders"
      // should only surface Exclusive purchases, never regular-site ones.
      exclusiveOrderIds = new Set(
        typedOrderItems
          .filter((i) => i.product_id && exclusiveProductIds.has(i.product_id))
          .map((i) => i.order_id)
      );
    }
  }

  const visibleOrders = isExclusiveScope
    ? typedOrders.filter((o) => exclusiveOrderIds.has(o.id))
    : typedOrders.filter((o) => !exclusiveOrderIds.has(o.id));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto flex-1">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wide text-white mb-8 text-center">
            My Account
          </h1>

          <div className="w-full md:px-[60px] max-w-2xl">
            <div className="flex flex-col gap-6">
              {digitalItems.length > 0 && (
                <div className="border border-white/20 p-6 flex flex-col gap-3">
                  <h2 className="text-sm uppercase tracking-tight font-medium text-white">
                    Your Downloads
                  </h2>
                  {digitalItems.map((item) => (
                    <DownloadButton
                      key={item.id}
                      productId={item.product_id!}
                      productName={item.product_name}
                    />
                  ))}
                </div>
              )}

              <div className="border border-white/20 p-6 flex flex-col gap-4">
                <h2 className="text-sm uppercase tracking-tight font-medium text-white">
                  {isExclusiveScope ? "Exclusive Order History" : "Order History"}
                </h2>

                {visibleOrders.length === 0 ? (
                  <p className="text-xs text-white/40 uppercase tracking-tight">
                    {isExclusiveScope ? "No exclusive orders yet" : "No orders yet"}
                  </p>
                ) : (
                  visibleOrders.map((order) => {
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
