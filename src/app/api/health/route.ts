import { NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";
import { procurementEngine } from "@/lib/agent/procurement-engine";

export async function GET() {
  const driverInfo = paypalClient.getDriverInfo();
  const telemetry = procurementEngine.getTelemetrySummary();

  return NextResponse.json({
    status: "ok",
    system: "PayAgent OS (NexusPay AI)",
    tagline: "Autonomous Agentic Commerce Gateway & Financial Operations Center",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    driver: driverInfo,
    telemetry: {
      totalRequests: telemetry.totalRequests,
      completedCount: telemetry.completedCount,
      rejectedCount: telemetry.rejectedCount,
      pendingApprovalCount: telemetry.pendingApprovalCount,
      totalSpend: telemetry.totalSpend,
    },
  });
}
