import { NextResponse } from "next/server";
import { procurementEngine } from "@/lib/agent/procurement-engine";
import { paypalClient } from "@/lib/paypal/client";

export async function GET() {
  const telemetry = procurementEngine.getTelemetrySummary();
  const balance = await paypalClient.getBalance();

  return NextResponse.json({
    ...telemetry,
    treasuryBalance: balance,
    systemStatus: "HEALTHY",
    timestamp: new Date().toISOString(),
  });
}
