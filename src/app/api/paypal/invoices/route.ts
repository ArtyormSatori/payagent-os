import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientEmail, recipientName, currencyCode, items, note, autoSend } = body;

    if (!recipientEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "recipientEmail and items array are required" },
        { status: 400 }
      );
    }

    const invoice = await paypalClient.createInvoice({
      recipientEmail,
      recipientName,
      currencyCode: currencyCode || "USD",
      items,
      note,
    });

    let sendResult = null;
    if (autoSend) {
      sendResult = await paypalClient.sendInvoice(invoice.id);
    }

    return NextResponse.json(
      {
        invoice,
        sendResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
