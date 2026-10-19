import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, description, referenceId, items } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be greater than 0." },
        { status: 400 }
      );
    }

    const order = await paypalClient.createOrder({
      amount: {
        currencyCode: currency || "USD",
        value: amount,
      },
      description: description || "PayAgent Commerce Order",
      referenceId,
      items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
