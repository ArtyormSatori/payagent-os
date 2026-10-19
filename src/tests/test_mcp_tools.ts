import { PAYPAL_MCP_TOOLS, executeMcpTool } from "../lib/mcp/paypal-mcp-tools";

export async function runMcpToolsTests(): Promise<{ suite: string; total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("SUITE 4: PayPal AI-Toolkit & MCP Agent Tool Dispatch");
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

  // Test 1: Verify MCP Tools Registry
  assert(PAYPAL_MCP_TOOLS.length >= 6, `MCP Registry exposes ${PAYPAL_MCP_TOOLS.length} tools`);
  const toolNames = PAYPAL_MCP_TOOLS.map((t) => t.name);
  assert(toolNames.includes("paypal_create_order"), "Contains paypal_create_order");
  assert(toolNames.includes("paypal_capture_order"), "Contains paypal_capture_order");
  assert(toolNames.includes("paypal_create_invoice"), "Contains paypal_create_invoice");
  assert(toolNames.includes("paypal_send_payout"), "Contains paypal_send_payout");
  assert(toolNames.includes("paypal_check_balance"), "Contains paypal_check_balance");
  assert(toolNames.includes("agent_procure_autonomous"), "Contains agent_procure_autonomous");

  // Test 2: MCP Tool: paypal_create_order
  const orderRes = await executeMcpTool("paypal_create_order", {
    amount: 120.0,
    currency: "USD",
    description: "Vector Database Subscription",
    referenceId: "MCP-REF-01",
  });
  assert(Boolean(orderRes.id), `MCP create_order returned Order ID: ${orderRes.id}`);
  assert(orderRes.status === "CREATED", `MCP order status is CREATED: ${orderRes.status}`);

  // Test 3: MCP Tool: paypal_capture_order
  const captureRes = await executeMcpTool("paypal_capture_order", {
    orderId: orderRes.id,
  });
  assert(captureRes.status === "COMPLETED", `MCP capture_order returned status: ${captureRes.status}`);

  // Test 4: MCP Tool: paypal_create_invoice
  const invRes = await executeMcpTool("paypal_create_invoice", {
    recipientEmail: "enterprise@client.com",
    recipientName: "Enterprise Client Corp",
    itemName: "AI Multi-Agent Swarm Orchestration",
    quantity: 1,
    unitPrice: 500.0,
  });
  assert(Boolean(invRes.id), `MCP create_invoice returned Invoice ID: ${invRes.id}`);
  assert(invRes.status === "DRAFT", `MCP invoice status is DRAFT: ${invRes.status}`);

  // Test 5: MCP Tool: paypal_send_payout
  const payoutRes = await executeMcpTool("paypal_send_payout", {
    recipientEmail: "subagent-coder@freelancer.net",
    amount: 60.0,
    note: "Payment for bug resolution",
  });
  assert(Boolean(payoutRes.batch_header?.payout_batch_id), `MCP send_payout returned batch ID: ${payoutRes.batch_header?.payout_batch_id}`);

  // Test 6: MCP Tool: paypal_check_balance
  const balanceRes = await executeMcpTool("paypal_check_balance", {});
  assert(balanceRes.available > 0 && balanceRes.currency === "USD", `MCP check_balance returned valid treasury data: $${balanceRes.available}`);

  // Test 7: MCP Tool: agent_procure_autonomous
  const procureRes = await executeMcpTool("agent_procure_autonomous", {
    agentId: "agent-mcp-executor",
    category: "COMPUTE",
    itemName: "Container MicroVM Slice",
    quantity: 1,
    unitPrice: 35.0,
    vendorName: "Render Cloud",
    vendorDomain: "render.com",
    justification: "Deploying microservice API runner for autonomous pipeline",
  });
  assert(procureRes.status === "COMPLETED", `MCP agent_procure_autonomous completed: ${procureRes.status}`);
  assert(Boolean(procureRes.transactionId), `MCP transaction ID: ${procureRes.transactionId}`);

  // Test 8: MCP Unknown tool throws
  let unknownThrew = false;
  try {
    await executeMcpTool("paypal_non_existent_tool", {});
  } catch {
    unknownThrew = true;
  }
  assert(unknownThrew, "Calling unknown MCP tool throws descriptive error");

  return { suite: "PayPal AI-Toolkit & MCP Agent Tool Dispatch", total: passed + failed, passed, failed };
}

if (process.argv[1] && process.argv[1].endsWith("test_mcp_tools.ts")) {
  runMcpToolsTests().then((res) => {
    console.log(`\nResult: ${res.passed}/${res.total} tests passed.`);
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
