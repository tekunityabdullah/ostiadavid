"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminProductTile from "@/app/admin/AdminProductTile";
import ProductForm from "@/app/admin/ProductForm";
import { AdminButton, AdminCard, AdminPageHeader, CardHeading } from "@/app/admin/ui";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadProducts = useCallback(() => {
    return fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handlePrintfulSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/printful/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExclusive: false }),
      });
      const data = await response.json();

      if (data.success) {
        alert(`Synced ${data.synced} products from Printful`);
        loadProducts();
      } else {
        alert("Failed to sync products");
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error syncing products");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="grid gap-10">
      <AdminPageHeader eyebrow="Admin dashboard" title="Products" />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <AdminCard>
          <CardHeading title="Add product" />
          <ProductForm onSuccess={loadProducts} />

          <div className="mt-6 border-t border-white/10 pt-6">
            <CardHeading eyebrow="Integration" title="Printful" />
            <AdminButton
              variant="secondary"
              onClick={handlePrintfulSync}
              disabled={syncing}
              className="w-full"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync products from Printful"}
            </AdminButton>
          </div>
        </AdminCard>

        <div className="grid gap-5">
          <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/55">Current products</h2>
            <span className="text-sm text-white/45">{products.length}</span>
          </div>

          {loading ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">Loading...</p>
          ) : products.length === 0 ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">No products yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((product) => (
                <AdminProductTile key={product.id} product={product} onDeleted={loadProducts} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
