import Header from "./components/Header";
import SubNav from "./components/SubNav";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import { getRegularProducts } from "@/lib/products";

export default async function Page() {
  const products = await getRegularProducts();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <SubNav />

      <main className="pt-32 flex justify-center w-full max-w-[1400px] mx-auto">
        <section className="flex flex-col items-center px-4 pt-6 pb-8 w-full">
          {products.length === 0 ? (
            <p className="text-sm text-white/50 uppercase tracking-tight py-12">
              No products yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-3 md:px-[60px]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
        
      </main>

      <Footer />
    </div>
  );
}
