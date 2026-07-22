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
      className="group cursor-pointer flex flex-col gap-1 no-underline"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
        <img
          alt={product.name}
          src={product.image}
          className="w-full h-full object-contain block transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
        />
        {product.is_exclusive && (
          <span className="absolute top-2 left-2 bg-white text-black text-[10px] uppercase tracking-tight px-2 py-1">
            Exclusive
          </span>
        )}
        {product.is_digital && (
          <span className="absolute top-2 right-2 bg-white text-black text-[10px] uppercase tracking-tight px-2 py-1">
            Digital
          </span>
        )}
      </div>
      <div className="text-center py-1">
        <div className="text-[11px] font-medium uppercase tracking-tight text-white leading-normal">
          {product.name}
        </div>
        <div className="text-[11px] text-white leading-normal mt-0.5">
          {formatPrice(product.price)}
        </div>
      </div>
    </Link>
  );
}
