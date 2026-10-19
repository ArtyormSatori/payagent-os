import { NextResponse } from "next/server";
import { procurementEngine } from "@/lib/agent/procurement-engine";
import { paypalClient } from "@/lib/paypal/client";

export async function GET() {
  if (procurementEngine.getAllExecutions().length === 0) {
    await procurementEngine.seedBaselineFleetTransactions();
  }
  const telemetry = procurementEngine.getTelemetrySummary();
  const balance = await paypalClient.getBalance();

  return NextResponse.json({
    ...telemetry,
    treasuryBalance: balance,
    systemStatus: "HEALTHY",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  await procurementEngine.seedBaselineFleetTransactions();
  const telemetry = procurementEngine.getTelemetrySummary();
  const balance = await paypalClient.getBalance();
  return NextResponse.json({
    success: true,
    message: "Fleet simulation initialized with baseline transactions",
    ...telemetry,
    treasuryBalance: balance,
  });
}
