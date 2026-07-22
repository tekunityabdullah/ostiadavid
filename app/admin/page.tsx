"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminProductTile from "./AdminProductTile";
import ProductForm from "./ProductForm";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Admin access is enforced server-side in proxy.ts middleware — this
    // component only renders for authenticated admin accounts.
    fetch("/api/admin/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

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
        // Reload products
        fetch("/api/admin/products")
          .then(res => res.json())
          .then(data => setProducts(data));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-10 px-5 pb-12 pt-32 md:px-10">
        <section className="grid gap-3 border-b border-white/15 pb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Admin dashboard
          </p>
          <h1 className="text-3xl font-medium uppercase tracking-tight md:text-5xl">
            Add products
          </h1>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="border border-white/15 p-5 md:p-6">
            <ProductForm />
            
            <div className="mt-6 border-t border-white/15 pt-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-white/55 mb-4">
                Printful Integration
              </h3>
              <button
                onClick={handlePrintfulSync}
                disabled={syncing}
                className="w-full bg-white text-black px-4 py-3 text-sm uppercase tracking-[0.16em] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? "Syncing..." : "Sync Products from Printful"}
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-white/55">
                Current products
              </h2>
              <span className="text-sm text-white/45">{products.length}</span>
            </div>

            {products.length === 0 ? (
              <p className="py-12 text-sm uppercase tracking-tight text-white/50">
                No products yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((product) => (
                  <AdminProductTile key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
