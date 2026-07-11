import { NextResponse } from "next/server";
import { printfulAPI } from "@/lib/printful";

export async function GET() {
  const response = await fetch("https://api.printful.com/store/products", {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  });

  const json = await response.json();

  console.log("First Product:");
  console.log(JSON.stringify(json.result[0], null, 2));

  return NextResponse.json({
    total: json.result.length,
    first: json.result[0],
  });
}