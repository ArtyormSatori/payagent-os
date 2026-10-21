# Devpost Submission Pack: PayAgent OS (NexusPay AI)

## Metadata
- **Title**: PayAgent OS (NexusPay AI)
- **Tagline**: Autonomous Agentic Commerce Gateway for the PayPal Platform. Bridging AI agent autonomy with real-world financial settlement securely via Policy Guardrails & MCP.
- **Built-with**: Next.js 14, TypeScript, PayPal Orders v2 API, Invoicing v2, Payouts v1, Model Context Protocol (MCP), AG Grid Enterprise Telemetry, Tailwind CSS, Zod.
- **Repo URL**: https://github.com/ArtyormSatori/payagent-os

## Project Story

### Inspiration
As autonomous AI agent fleets proliferate, they face a fundamental friction: they need real money to procure real-world infrastructure, but developer tools either offer zero-guardrail financial access (high risk) or destroy autonomy (manual checkout). PayAgent OS solves this.

### What it does
PayAgent OS is an enterprise-grade autonomous commerce operating system built directly on the PayPal Developer Platform, protected by a deterministic AI Policy Guardrail & Risk Engine, monitored in real-time via an AG Grid Telemetry Operations Center, and natively callable by any autonomous agent via the Model Context Protocol (MCP).

### How we built it
- **PayPal Integration**: Dual-mode engine supporting live PayPal Sandbox and hermetic unit testing.
- **AI Guardrails**: Tiered financial limits, vendor allowlisting, prompt-injection defense, and HITL authorization workflows.
- **AG Grid Telemetry**: High-throughput dashboard for audit logs, transaction sorting, and real-time fleet operations.
- **MCP Standard**: Standardized JSON-RPC tools for immediate integration into Claude, Hermes, and Cursor.

### Challenges
Balancing absolute autonomy with high-stakes financial risk. We overcame this by implementing deterministic policy guardrails that analyze transaction intent before invoking PayPal APIs.

### Accomplishments
- Successfully implemented 10/10 required system routes.
- Passed 94/94 rigorous test assertions with 100% success rate.
- Built a modular, secure, and production-ready financial commerce OS.

### What we learned
Building agentic financial systems requires prioritizing deterministic security controls over raw performance. A robust policy guardrail is as important as the settlement engine itself.

### What's next
- Expanding support for multi-party invoice settlements.
- Integrating more advanced risk-scoring models using AI agent telemetry.

## Video Demo Script (2-3 Minutes)
1. **0:00 - 0:30 (Intro)**: Hook - agents need real money; introducing PayAgent OS.
2. **0:30 - 1:15 (Live Demo)**: Interactive Arena - 3 presets (Procure, Invoicing, Bounty Payout).
3. **1:15 - 2:00 (Policy & Security)**: Preset 4 (Escalation) + Preset 5 (Rogue Injection Block).
4. **2:00 - 2:30 (Outro)**: AG Grid telemetry, summary, call to action.

## User Action Checklist
- [ ] Create Devpost draft.
- [ ] Obtain PayPal Developer Sandbox credentials.
- [ ] Submit before 13/11/2026 03:00 +07.

## Bang chung kiem thu (npm test)

================================================================================
PAYAGENT OS (NEXUSPAY AI) - FULL CORE HERMETIC TEST SUITE
================================================================================

=======================================================
SUITE 1: PayPal Unified Client & Dual-Mode Drivers
=======================================================
  ✓ PASS: Driver is initialized in mock mode
  ✓ PASS: Waiting point is clearly documented
  ✓ PASS: Order ID correctly generated: ORD-MOCK-Q0J5D909KV53VJ
  ✓ PASS: Order status is CREATED: CREATED
  ✓ PASS: Order amount formatted to 2 decimals: 99.50
  ✓ PASS: Order contains PayPal approval HATEOAS link
  ✓ PASS: Fetched order matches created order
  ✓ PASS: Captured order ID matches
  ✓ PASS: Order capture status is COMPLETED: COMPLETED
  ✓ PASS: Capture contains valid PayPal capture ID
  ✓ PASS: Re-capturing already completed order is guarded and rejected
  ✓ PASS: Invoice generated: INV2-MOCK-JP7DU0W0A9H8
  ✓ PASS: Invoice initial status is DRAFT: DRAFT
  ✓ PASS: Invoice amount is $300.00: 300.00
  ✓ PASS: Invoice transitioned to SENT status
  ✓ PASS: Payout batch created: PAYOUT-BATCH-8KNWEK3JEHU4
  ✓ PASS: Payout transaction item marked SUCCESS
  ✓ PASS: Treasury balance accessible: $12400.5 USD
  ✓ PASS: Real driver identifies as sandbox
  ✓ PASS: Real driver fails with clear authentication error when dummy key is tested

=======================================================
SUITE 2: AI Procurement Policy Guardrails & Injection Defense
=======================================================
  ✓ PASS: Standard request within budget is APPROVED: APPROVE
  ✓ PASS: High confidence for clean request: 0.98
  ✓ PASS: Budget check passed
  ✓ PASS: Vendor check passed
  ✓ PASS: Security scan passed
  ✓ PASS: Price calculation mismatch is REJECTED: REJECT
  ✓ PASS: Budget check flagged mismatch
  ✓ PASS: Exceeding max transaction limit is ESCALATED: ESCALATE_TO_HUMAN
  ✓ PASS: Requires human approval flagged
  ✓ PASS: Projected daily spend overflow is ESCALATED: ESCALATE_TO_HUMAN
  ✓ PASS: Transaction above $250 threshold is ESCALATED: ESCALATE_TO_HUMAN
  ✓ PASS: Blocked vendor is REJECTED: REJECT
  ✓ PASS: Trust level marked BLOCKED
  ✓ PASS: Prompt injection (ignore instructions) is REJECTED: REJECT
  ✓ PASS: Prompt injection flag set to true
  ✓ PASS: System prompt override attack is REJECTED: REJECT
  ✓ PASS: Sudo bypass attempt in item name is REJECTED: REJECT
  ✓ PASS: DAN mode exploit attempt is REJECTED: REJECT

=======================================================
SUITE 3: Autonomous Procurement Engine & Audit Lifecycle
=======================================================
  ✓ PASS: Autonomous purchase COMPLETED: COMPLETED
  ✓ PASS: Generated valid transaction ID: TX-NEXUS-mvh2bwoq-27UJG6
  ✓ PASS: Contains PayPal Order ID: ORD-MOCK-Q6NAQ56P4I6JV5
  ✓ PASS: Detailed audit trail recorded: 5 steps
  ✓ PASS: Daily spend incremented to $45.00: 45
  ✓ PASS: Invoice execution COMPLETED: COMPLETED
  ✓ PASS: PayPal Invoice ID present: INV2-MOCK-6CLGMEEABQYQ
  ✓ PASS: Payout execution COMPLETED: COMPLETED
  ✓ PASS: Payout Batch ID present: PAYOUT-BATCH-890K9OAOY9K7
  ✓ PASS: Daily spend tracked at $120.00: 120
  ✓ PASS: Malicious injection REJECTED: REJECTED
  ✓ PASS: Zero funds disbursed on rejected attack
  ✓ PASS: High-value request queued as PENDING_APPROVAL: PENDING_APPROVAL
  ✓ PASS: Pending escalation queue contains 1 item
  ✓ PASS: Escalated request successfully approved and COMPLETED: COMPLETED
  ✓ PASS: Audit log reflects human approval sign-off
  ✓ PASS: Pending queue cleared after sign-off
  ✓ PASS: Daily spend updated to $500.00: 500
  ✓ PASS: Telemetry records 5 total requests: 5
  ✓ PASS: Telemetry records 4 completed requests: 4
  ✓ PASS: Telemetry records 1 rejected request: 1
  ✓ PASS: Telemetry records total spend $700.00: 700

=======================================================
SUITE 4: PayPal AI-Toolkit & MCP Agent Tool Dispatch
=======================================================
  ✓ PASS: MCP Registry exposes 6 tools
  ✓ PASS: Contains paypal_create_order
  ✓ PASS: Contains paypal_capture_order
  ✓ PASS: Contains paypal_create_invoice
  ✓ PASS: Contains paypal_send_payout
  ✓ PASS: Contains paypal_check_balance
  ✓ PASS: Contains agent_procure_autonomous
  ✓ PASS: MCP create_order returned Order ID: ORD-MOCK-TMV7Z2AV9LZBYP
  ✓ PASS: MCP order status is CREATED: CREATED
  ✓ PASS: MCP capture_order returned status: COMPLETED
  ✓ PASS: MCP create_invoice returned Invoice ID: INV2-MOCK-HL9FKQY1YJJM
  ✓ PASS: MCP invoice status is DRAFT: DRAFT
  ✓ PASS: MCP send_payout returned batch ID: PAYOUT-BATCH-36WO0HNFD98G
  ✓ PASS: MCP check_balance returned valid treasury data: $11955
  ✓ PASS: MCP agent_procure_autonomous completed: COMPLETED
  ✓ PASS: MCP transaction ID: TX-NEXUS-mvh2bx9b-8WDONN
  ✓ PASS: Calling unknown MCP tool throws descriptive error

=======================================================
SUITE 5: Full E2E Workflow & AG Grid Telemetry Contracts
=======================================================
  ✓ PASS: Baseline seed populated >= 5 requests (6)
  ✓ PASS: allTransactions array contains >= 5 items (6)
  ✓ PASS: Row has valid TX ID
  ✓ PASS: Row has valid agentId: rogue-probe-scanner
  ✓ PASS: Row has valid agentRole: Untrusted Sub-Agent Worker
  ✓ PASS: Row has valid category: HARDWARE
  ✓ PASS: Row has valid itemName: Cryptocurrency Hardware Miner
  ✓ PASS: Row has valid vendorName: Anonymous Crypto Vendor
  ✓ PASS: Row has positive numeric amount: 350
  ✓ PASS: Row has currency: USD
  ✓ PASS: Row has paymentMethod: PAYPAL_ORDER
  ✓ PASS: Row has status: REJECTED
  ✓ PASS: Row has non-empty auditTrail (3 steps)
  ✓ PASS: At least 1 item is escalated pending approval (1)
  ✓ PASS: Escalated item successfully approved: status COMPLETED
  ✓ PASS: Settlement reference present: ORD-MOCK-N582FWX1RDQ3XM
  ✓ PASS: PayPal Treasury reports balance: $10438

================================================================================
TEST SUMMARY MATRIX
================================================================================
- PayPal Unified Client & Dual-Mode Drivers              : 20/20 passed [✓ ALL PASSED]
- AI Procurement Policy Guardrails & Injection Defense   : 18/18 passed [✓ ALL PASSED]
- Autonomous Procurement Engine & Audit Lifecycle        : 22/22 passed [✓ ALL PASSED]
- PayPal AI-Toolkit & MCP Agent Tool Dispatch            : 17/17 passed [✓ ALL PASSED]
- E2E Workflow & AG Grid Telemetry Contracts             : 17/17 passed [✓ ALL PASSED]
--------------------------------------------------------------------------------
TOTAL: 94/94 tests passed in 3209ms
OVERALL VERDICT: SUCCESS (100% PASS)
================================================================================
