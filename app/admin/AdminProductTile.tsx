"use client";

import { useState } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "./actions";
import { AdminButton, AdminModal } from "./ui";
import ProductForm from "./ProductForm";

interface AdminProductTileProps {
  product: Product;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export default function AdminProductTile({ product, onDeleted, onUpdated }: AdminProductTileProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

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
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package size={32} className="text-white/30" />
        )}
      </div>

      <div className="grid gap-1">
        <p className="truncate text-sm uppercase tracking-tight text-white">{product.name}</p>
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
          {product.price != null ? formatPrice(product.price) : "No price"}
          {product.is_exclusive ? " · Exclusive" : ""}
          {product.is_digital ? " · Digital" : ""}
          {product.external_checkout_url ? " · External checkout" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AdminButton type="button" variant="secondary" onClick={() => setEditing(true)} className="w-full">
          <Pencil size={14} />
          Edit
        </AdminButton>
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

      {editing && (
        <AdminModal title="Edit product" onClose={() => setEditing(false)}>
          <ProductForm
            product={product}
            onSuccess={() => {
              setEditing(false);
              onUpdated?.();
            }}
          />
        </AdminModal>
      )}
    </div>
  );
}
