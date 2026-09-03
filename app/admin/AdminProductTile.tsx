"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { deleteProduct, moveProductOrder } from "./actions";
import { AdminButton, AdminModal } from "./ui";
import ProductForm from "./ProductForm";

interface AdminProductTileProps {
  product: Product;
  /** 1-based position within its own is_exclusive group — display only. */
  position?: number;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export default function AdminProductTile({ product, position, onDeleted, onUpdated }: AdminProductTileProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setDeleting(true);
    const formData = new FormData();
    formData.set("product_id", product.id);

    try {
      const result = await deleteProduct(formData);
      if (!result.ok) {
        alert(result.message);
        return;
      }
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (direction: "up" | "down") => {
    setMoving(true);
    const formData = new FormData();
    formData.set("product_id", product.id);
    formData.set("direction", direction);

    try {
      await moveProductOrder(formData);
      onUpdated?.();
    } finally {
      setMoving(false);
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
          {product.collection ? ` · ${product.collection}` : ""}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border border-white/10 px-1 py-1">
        <button
          type="button"
          onClick={() => handleMove("up")}
          disabled={moving}
          aria-label="Move up"
          className="p-1.5 text-white/60 transition hover:text-white disabled:opacity-40"
        >
          <ChevronUp size={14} />
        </button>
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
          {position != null ? `#${position}` : ""}
        </span>
        <button
          type="button"
          onClick={() => handleMove("down")}
          disabled={moving}
          aria-label="Move down"
          className="p-1.5 text-white/60 transition hover:text-white disabled:opacity-40"
        >
          <ChevronDown size={14} />
        </button>
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
