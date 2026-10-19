import { PayPalUnifiedClient } from "../lib/paypal/client";
import { MockPayPalDriver } from "../lib/paypal/mock-driver";
import { RealPayPalDriver } from "../lib/paypal/real-driver";

export async function runPayPalClientTests(): Promise<{ suite: string; total: number; passed: number; failed: number }> {
  console.log("\n=======================================================");
  console.log("SUITE 1: PayPal Unified Client & Dual-Mode Drivers");
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

  const client = new PayPalUnifiedClient("mock");

  // Test 1: Driver info
  const info = client.getDriverInfo();
  assert(info.mode === "mock", "Driver is initialized in mock mode");
  assert(info.credentialsWaitingPoint.includes("STANDBY") || info.credentialsWaitingPoint.includes("READY"), "Waiting point is clearly documented");

  // Test 2: Create Order
  const order = await client.createOrder({
    amount: { currencyCode: "USD", value: 99.5 },
    description: "Cloud GPU Cluster Hours",
    referenceId: "REF-TEST-001",
  });
  assert(order.id.startsWith("ORD-MOCK-"), `Order ID correctly generated: ${order.id}`);
  assert(order.status === "CREATED", `Order status is CREATED: ${order.status}`);
  assert(order.purchase_units[0].amount.value === "99.50", `Order amount formatted to 2 decimals: ${order.purchase_units[0].amount.value}`);
  assert(order.links.some((l) => l.rel === "approve"), "Order contains PayPal approval HATEOAS link");

  // Test 3: Get Order
  const fetched = await client.getOrder(order.id);
  assert(fetched.id === order.id && fetched.status === "CREATED", "Fetched order matches created order");

  // Test 4: Capture Order
  const capture = await client.captureOrder(order.id);
  assert(capture.id === order.id, "Captured order ID matches");
  assert(capture.status === "COMPLETED", `Order capture status is COMPLETED: ${capture.status}`);
  assert(Boolean(capture.purchase_units[0].payments.captures[0]?.id), "Capture contains valid PayPal capture ID");

  // Test 5: Re-capturing throws error (Idempotency / State Guard)
  let threwOnReCapture = false;
  try {
    await client.captureOrder(order.id);
  } catch (err: any) {
    threwOnReCapture = true;
  }
  assert(threwOnReCapture, "Re-capturing already completed order is guarded and rejected");

  // Test 6: Create & Send Invoice
  const invoice = await client.createInvoice({
    recipientEmail: "client@enterprise.org",
    recipientName: "Acme Corp",
    items: [
      { name: "Autonomous Market Analysis", quantity: 2, unitPrice: 150.0 },
    ],
  });
  assert(invoice.id.startsWith("INV2-MOCK-"), `Invoice generated: ${invoice.id}`);
  assert(invoice.status === "DRAFT", `Invoice initial status is DRAFT: ${invoice.status}`);
  assert(invoice.amount.value === "300.00", `Invoice amount is $300.00: ${invoice.amount.value}`);

  const sendResult = await client.sendInvoice(invoice.id);
  assert(sendResult.success && sendResult.status === "SENT", "Invoice transitioned to SENT status");

  // Test 7: Payout
  const payout = await client.createPayout({
    recipientEmail: "subagent-worker@dao.network",
    amount: 50.0,
    note: "Settlement for dataset preparation task",
  });
  assert(payout.batch_header.payout_batch_id.startsWith("PAYOUT-BATCH-"), `Payout batch created: ${payout.batch_header.payout_batch_id}`);
  assert(payout.items[0].transaction_status === "SUCCESS", "Payout transaction item marked SUCCESS");

  // Test 8: Get Balance
  const balance = await client.getBalance();
  assert(balance.currency === "USD" && balance.available > 0, `Treasury balance accessible: $${balance.available} ${balance.currency}`);

  // Test 9: Real Driver handles placeholder credentials gracefully
  const dummyRealDriver = new RealPayPalDriver("DUMMY_CLIENT_ID", "DUMMY_SECRET");
  assert(dummyRealDriver.name === "sandbox", "Real driver identifies as sandbox");
  let failedGracefully = false;
  try {
    await dummyRealDriver.createOrder({
      amount: { currencyCode: "USD", value: 10 },
      description: "Test",
    });
  } catch (e: any) {
    failedGracefully = true;
    assert(e.message.includes("Failed to retrieve access token") || e.message.includes("401"), "Real driver fails with clear authentication error when dummy key is tested");
  }

  return { suite: "PayPal Unified Client & Dual-Mode Drivers", total: passed + failed, passed, failed };
}

if (process.argv[1] && process.argv[1].endsWith("test_paypal_client.ts")) {
  runPayPalClientTests().then((res) => {
    console.log(`\nResult: ${res.passed}/${res.total} tests passed.`);
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
