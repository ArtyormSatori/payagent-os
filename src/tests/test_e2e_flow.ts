import { procurementEngine } from "../lib/agent/procurement-engine";
import { paypalClient } from "../lib/paypal/client";

export async function runE2ETests(): Promise<{ suite: string; total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("SUITE 5: Full E2E Workflow & AG Grid Telemetry Contracts");
  console.log("=======================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Initialize Baseline Seed
  await procurementEngine.seedBaselineFleetTransactions(true);
  const summary = procurementEngine.getTelemetrySummary();

  assert(summary.totalRequests >= 5, `Baseline seed populated >= 5 requests (${summary.totalRequests})`);
  assert(summary.allTransactions.length >= 5, `allTransactions array contains >= 5 items (${summary.allTransactions.length})`);

  // 2. Validate AG Grid Contract Schema
  const firstRow = summary.allTransactions[0];
  assert(typeof firstRow.transactionId === "string" && firstRow.transactionId.startsWith("TX-NEXUS-"), "Row has valid TX ID");
  assert(typeof firstRow.agentId === "string" && firstRow.agentId.length > 0, `Row has valid agentId: ${firstRow.agentId}`);
  assert(typeof firstRow.agentRole === "string", `Row has valid agentRole: ${firstRow.agentRole}`);
  assert(typeof firstRow.category === "string", `Row has valid category: ${firstRow.category}`);
  assert(typeof firstRow.itemName === "string", `Row has valid itemName: ${firstRow.itemName}`);
  assert(typeof firstRow.vendorName === "string", `Row has valid vendorName: ${firstRow.vendorName}`);
  assert(typeof firstRow.amount === "number" && firstRow.amount > 0, `Row has positive numeric amount: ${firstRow.amount}`);
  assert(typeof firstRow.currency === "string", `Row has currency: ${firstRow.currency}`);
  assert(typeof firstRow.paymentMethod === "string", `Row has paymentMethod: ${firstRow.paymentMethod}`);
  assert(typeof firstRow.status === "string", `Row has status: ${firstRow.status}`);
  assert(Array.isArray(firstRow.auditTrail) && firstRow.auditTrail.length > 0, `Row has non-empty auditTrail (${firstRow.auditTrail.length} steps)`);

  // 3. Test Human Sign-off flow on escalated seed item
  const pendingItems = summary.allTransactions.filter((t) => t.status === "PENDING_APPROVAL");
  assert(pendingItems.length >= 1, `At least 1 item is escalated pending approval (${pendingItems.length})`);

  if (pendingItems.length > 0) {
    const target = pendingItems[0];
    const approved = await procurementEngine.approveEscalated(target.requestId, "E2E Test Supervisor");
    assert(approved.status === "COMPLETED", `Escalated item successfully approved: status ${approved.status}`);
    assert(!!approved.paymentReferenceId, `Settlement reference present: ${approved.paymentReferenceId}`);
  }

  // 4. Test PayPal Treasury Balance Retrieval
  const balance = await paypalClient.getBalance();
  assert(typeof balance.available === "number" && balance.available > 0, `PayPal Treasury reports balance: $${balance.available}`);

  return {
    suite: "E2E Workflow & AG Grid Telemetry Contracts",
    total: passed + failed,
    passed,
    failed,
  };
}

if (require.main === module) {
  runE2ETests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
