"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addProduct, type ProductFormState } from "./actions";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

export default function ProductForm() {
  const [state, formAction, pending] = useActionState(addProduct, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-xs uppercase tracking-[0.18em] text-white/50">
          Product name
        </label>
        <input
          name="name"
          required
          className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none focus:border-white"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.18em] text-white/50">
            Price
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none focus:border-white"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.18em] text-white/50">
            Category
          </label>
          <input
            name="category"
            placeholder="apparel, digital, accessories"
            className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs uppercase tracking-[0.18em] text-white/50">
          Image URL
        </label>
        <input
          name="image"
          type="url"
          required
          className="h-11 border border-white/20 bg-black px-3 text-sm text-white outline-none focus:border-white"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs uppercase tracking-[0.18em] text-white/50">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          className="resize-none border border-white/20 bg-black px-3 py-3 text-sm text-white outline-none focus:border-white"
        />
      </div>

      <label className="flex items-center gap-3 text-sm uppercase tracking-tight text-white">
        <input
          name="is_exclusive"
          type="checkbox"
          className="size-4 accent-white"
        />
        Exclusive product
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 border border-white bg-white px-5 text-sm font-medium uppercase tracking-tight text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          {pending ? "Adding..." : "Add product"}
        </button>

        {state.message && (
          <p
            className={`text-sm ${
              state.ok ? "text-white/70" : "text-red-300"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
