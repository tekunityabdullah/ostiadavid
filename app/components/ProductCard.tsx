import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group cursor-pointer flex flex-col gap-4 no-underline"
    >
      <div className="relative w-full h-[300px] overflow-hidden bg-black md:aspect-[3/4] md:h-auto">
        <img
          alt={product.name}
          src={product.image}
          className="w-full h-full object-cover block transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
        />
        {product.is_exclusive && (
          <span className="absolute top-2 left-2 bg-white text-black text-[10px] uppercase tracking-tight px-2 py-1">
            Exclusive
          </span>
        )}
      </div>
      <div className="text-center py-2">
        <div className="text-sm md:text-lg font-medium uppercase tracking-tight text-white leading-normal">
          {product.name}
        </div>
        <div className="text-xs md:text-sm text-white leading-normal mt-1">
          {formatPrice(product.price)}
        </div>
      </div>
    </Link>
  );
}
