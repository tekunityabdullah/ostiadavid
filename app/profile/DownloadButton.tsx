"use client";

import { useState } from "react";
import { getDigitalDownloadUrl } from "./actions";

interface DownloadButtonProps {
  productId: string;
  productName: string;
}

export default function DownloadButton({ productId, productName }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    const result = await getDigitalDownloadUrl(productId);

    if (result.url) {
      window.open(result.url, "_blank");
    } else {
      setError(result.error || "Could not get download link.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs uppercase tracking-tight text-white underline hover:text-white/70 transition-colors disabled:opacity-50 text-left"
      >
        {loading ? "Preparing..." : `Download ${productName}`}
      </button>
      {error && <p className="text-[10px] text-red-300">{error}</p>}
    </div>
  );
}
