  import { createClient } from "@/lib/supabase/server";
  import type { Product } from "@/lib/types";
  import { getAccountType } from "@/lib/auth";

  export async function getRegularProducts(): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_exclusive", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch products:", error.message);
      return [];
    }

    return (data ?? []) as Product[];
  }

  export async function getVisibleProducts(): Promise<Product[]> {
    const accountType = await getAccountType();
    const supabase = await createClient();

    let query = supabase.from("products").select("*").order("created_at", {
      ascending: false,
    });

    if (accountType !== "exclusive" && accountType !== "admin") {
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
      .order("created_at", { ascending: false });

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
      if (accountType !== "exclusive" && accountType !== "admin") return null;
    }

    return product;
  }

  export async function getProductsByCategory(
    category: string
  ): Promise<Product[]> {
    const products = await getRegularProducts();
    return products.filter((p) => p.category === category);
  }
