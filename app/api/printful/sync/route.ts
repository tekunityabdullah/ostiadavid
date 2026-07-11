import { NextResponse } from "next/server";
import { printfulAPI, printfulProductToSupabase } from "@/lib/printful";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    console.log("Printful API Key exists:", !!process.env.PRINTFUL_API_KEY);
    
    if (!printfulAPI) {
      console.error("Printful API not configured - API key missing");
      return NextResponse.json(
        { error: "Printful API not configured - check PRINTFUL_API_KEY in .env" },
        { status: 500 }
      );
    }

    const { isExclusive = false } = await request.json();

    console.log("Fetching products from Printful...");
    // Fetch all products from Printful
    const printfulProducts = await printfulAPI.getProducts();
    console.log(`Fetched ${printfulProducts.length} products from Printful`);

    const supabase = await createServiceClient();
    const syncedProducts = [];
    const errors = [];

    for (const product of printfulProducts) {
      try {
        console.log(`Syncing product: ${product.name} (${product.id})`);

        // Fetch variants (and retail prices) for this product
        const detail = await printfulAPI.getStoreProduct(product.id);

        // Check if product already exists in database
        const { data: existing } = await supabase
          .from("products")
          .select("*")
          .eq("printful_id", product.id)
          .maybeSingle();

        const productData = printfulProductToSupabase(product, detail.sync_variants, isExclusive);

        if (existing) {
          // Update existing product
          const { error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", existing.id);

          if (error) throw error;
          syncedProducts.push({ id: existing.id, action: "updated", name: product.name });
        } else {
          // Insert new product
          const { data, error } = await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

          if (error) throw error;
          syncedProducts.push({ id: data.id, action: "created", name: product.name });
        }
      } catch (error) {
        console.error(`Failed to sync product ${product.id}:`, error);
        const message =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error && "message" in error
              ? String((error as { message: unknown }).message)
              : String(error);
        errors.push({ productId: product.id, name: product.name, error: message });
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedProducts.length,
      products: syncedProducts,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Printful sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync products from Printful" },
      { status: 500 }
    );
  }
}
