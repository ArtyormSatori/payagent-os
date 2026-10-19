import { NextRequest, NextResponse } from "next/server";
import { procurementEngine } from "@/lib/agent/procurement-engine";
import { ProcurementRequest } from "@/lib/agent/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support human sign-off action on escalated requests
    if (body.action === "APPROVE_ESCALATED" && body.requestId) {
      const approver = body.approver || "Admin / Human Supervisor";
      const result = await procurementEngine.approveEscalated(body.requestId, approver);
      return NextResponse.json(result, { status: 200 });
    }

    // Standard autonomous procurement intent
    const {
      agentId,
      agentRole,
      category,
      item,
      vendor,
      paymentMethod,
      justification,
      urgency,
      metadata,
    } = body;

    if (!agentId || !category || !item || !vendor || !justification) {
      return NextResponse.json(
        {
          error: "Missing required fields: agentId, category, item, vendor, justification are mandatory.",
        },
        { status: 400 }
      );
    }

    const request: ProcurementRequest = {
      id: body.id || `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      agentRole: agentRole || "Autonomous Agent",
      category,
      item: {
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: Number(item.unitPrice),
        totalAmount: Number(item.totalAmount || (item.quantity || 1) * item.unitPrice),
        currency: item.currency || "USD",
        description: item.description,
      },
      vendor: {
        name: vendor.name,
        domain: vendor.domain,
        recipientEmail: vendor.recipientEmail,
        country: vendor.country,
      },
      paymentMethod: paymentMethod || "PAYPAL_ORDER",
      justification,
      urgency: urgency || "MEDIUM",
      createdTime: new Date().toISOString(),
      metadata,
    };

    const result = await procurementEngine.submitAndExecute(request);

    let statusHttp = 200;
    if (result.status === "PENDING_APPROVAL") statusHttp = 202;
    if (result.status === "REJECTED") statusHttp = 403;
    if (result.status === "FAILED") statusHttp = 502;

    return NextResponse.json(result, { status: statusHttp });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process agent procurement" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const executions = procurementEngine.getAllExecutions();
  const pending = procurementEngine.getPendingRequests();
  return NextResponse.json({
    executions,
    pending,
  });
}
