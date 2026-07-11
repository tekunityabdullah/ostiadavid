import { NextResponse } from "next/server";
import { printfulAPI } from "@/lib/printful";

export async function POST(request: Request) {
  try {
    if (!printfulAPI) {
      return NextResponse.json(
        { error: "Printful API not configured" },
        { status: 500 }
      );
    }

    const orderData = await request.json();

    // Validate required fields
    if (!orderData.shipping || !orderData.recipient || !orderData.items || !orderData.items.length) {
      return NextResponse.json(
        { error: "Missing required fields: shipping, recipient, or items" },
        { status: 400 }
      );
    }

    // Create order on Printful
    const order = await printfulAPI.createOrder(orderData);

    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Printful order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order on Printful" },
      { status: 500 }
    );
  }
}

// Get order estimate
export async function PUT(request: Request) {
  try {
    if (!printfulAPI) {
      return NextResponse.json(
        { error: "Printful API not configured" },
        { status: 500 }
      );
    }

    const estimateData = await request.json();

    // Validate required fields
    if (!estimateData.shipping || !estimateData.recipient || !estimateData.items || !estimateData.items.length) {
      return NextResponse.json(
        { error: "Missing required fields: shipping, recipient, or items" },
        { status: 400 }
      );
    }

    // Get order estimate from Printful
    const estimate = await printfulAPI.getOrderEstimate(estimateData);

    return NextResponse.json({
      success: true,
      estimate: estimate,
    });
  } catch (error) {
    console.error("Printful estimate error:", error);
    return NextResponse.json(
      { error: "Failed to get order estimate from Printful" },
      { status: 500 }
    );
  }
}
