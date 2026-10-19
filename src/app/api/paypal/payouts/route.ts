import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientEmail, amount, currencyCode, note, senderItemId } = body;

    if (!recipientEmail || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "recipientEmail and positive amount are required" },
        { status: 400 }
      );
    }

    const payout = await paypalClient.createPayout({
      recipientEmail,
      amount,
      currencyCode: currencyCode || "USD",
      note,
      senderItemId,
    });

    return NextResponse.json(payout, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disburse payout" },
      { status: 500 }
    );
  }
}
