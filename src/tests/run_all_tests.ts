import { runPayPalClientTests } from "./test_paypal_client";
import { runPolicyGuardrailTests } from "./test_policy_guardrails";
import { runProcurementEngineTests } from "./test_procurement_engine";
import { runMcpToolsTests } from "./test_mcp_tools";
import { runE2ETests } from "./test_e2e_flow";

async function main() {
  const startTime = Date.now();
  console.log("================================================================================");
  console.log("PAYAGENT OS (NEXUSPAY AI) - FULL CORE HERMETIC TEST SUITE");
  console.log("================================================================================");

  const results = [];
  results.push(await runPayPalClientTests());
  results.push(await runPolicyGuardrailTests());
  results.push(await runProcurementEngineTests());
  results.push(await runMcpToolsTests());
  results.push(await runE2ETests());

  const durationMs = Date.now() - startTime;
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log("\n================================================================================");
  console.log("TEST SUMMARY MATRIX");
  console.log("================================================================================");
  for (const r of results) {
    totalTests += r.total;
    totalPassed += r.passed;
    totalFailed += r.failed;
    const statusMark = r.failed === 0 ? "✓ ALL PASSED" : `✗ ${r.failed} FAILED`;
    console.log(`- ${r.suite.padEnd(55)}: ${r.passed}/${r.total} passed [${statusMark}]`);
  }
  console.log("--------------------------------------------------------------------------------");
  console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed in ${durationMs}ms`);
  console.log(`OVERALL VERDICT: ${totalFailed === 0 ? "SUCCESS (100% PASS)" : "FAILURE"}`);
  console.log("================================================================================");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
