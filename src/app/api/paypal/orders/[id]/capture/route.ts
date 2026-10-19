import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required order ID" },
        { status: 400 }
      );
    }

    const capture = await paypalClient.captureOrder(orderId);
    return NextResponse.json(capture, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
