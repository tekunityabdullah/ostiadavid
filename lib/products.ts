  import { createClient } from "@/lib/supabase/server";
  import type { Product } from "@/lib/types";
  import { getAccountType, isAdmin } from "@/lib/auth";

  export async function getRegularProducts(): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_exclusive", false)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch products:", error.message);
      return [];
    }

    return (data ?? []) as Product[];
  }

  export async function getVisibleProducts(): Promise<Product[]> {
    const accountType = await getAccountType();
    const supabase = await createClient();

    let query = supabase.from("products").select("*").order("sort_order", {
      ascending: true,
    });

    if (accountType !== "exclusive" && !(await isAdmin())) {
      query = query.eq("is_exclusive", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch products:", error.message);
      return [];
    }

    return (data ?? []) as Product[];
  }

  export async function getExclusiveProducts(): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_exclusive", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch exclusive products:", error.message);
      return [];
    }

    return (data ?? []) as Product[];
  }

  export async function getProductById(id: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const product = data as Product;
    if (product.is_exclusive) {
      const accountType = await getAccountType();
      if (accountType !== "exclusive" && !(await isAdmin())) return null;
    }

    return product;
  }

  export async function getProductsByCategory(
    category: string
  ): Promise<Product[]> {
    const products = await getRegularProducts();
    return products.filter((p) => p.category === category);
  }

  // The Collections page only shows products an admin has explicitly
  // assigned to a named collection (e.g. "Self Titled") — not every regular
  // product. Grouped in collection-name order, products within each group
  // keep the same manual sort_order used everywhere else.
  export async function getProductCollections(): Promise<
    { name: string; products: Product[] }[]
  > {
    const products = await getRegularProducts();
    const groups = new Map<string, Product[]>();

    for (const product of products) {
      const name = product.collection?.trim();
      if (!name) continue;
      const existing = groups.get(name);
      if (existing) existing.push(product);
      else groups.set(name, [product]);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, products]) => ({ name, products }));
  }
