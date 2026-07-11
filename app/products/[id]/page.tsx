import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductDetail from "./ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
