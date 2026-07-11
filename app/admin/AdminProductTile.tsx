"use client";

import { Trash2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { Product } from "@/lib/types";
import { deleteProduct } from "./actions";

interface AdminProductTileProps {
  product: Product;
}

export default function AdminProductTile({ product }: AdminProductTileProps) {
  return (
    <div className="grid gap-3">
      <ProductCard product={product} />
      <form
        action={deleteProduct}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${product.name}"?`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="product_id" value={product.id} />
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-2 border border-red-300/35 bg-black px-3 text-xs font-medium uppercase tracking-tight text-red-200 transition hover:border-red-200 hover:bg-red-950/30"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </form>
    </div>
  );
}
