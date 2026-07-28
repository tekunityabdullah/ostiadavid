"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { Product } from "@/lib/types";
import { deleteProduct } from "./actions";
import { AdminButton } from "./ui";

interface AdminProductTileProps {
  product: Product;
  onDeleted?: () => void;
}

export default function AdminProductTile({ product, onDeleted }: AdminProductTileProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setDeleting(true);
    const formData = new FormData();
    formData.set("product_id", product.id);

    try {
      await deleteProduct(formData);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
      <ProductCard product={product} />
      <AdminButton
        type="button"
        variant="danger"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full"
      >
        <Trash2 size={14} />
        {deleting ? "Deleting..." : "Delete"}
      </AdminButton>
    </div>
  );
}
