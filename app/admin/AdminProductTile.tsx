"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { Product } from "@/lib/types";
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
      <ProductCard product={product} />

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
