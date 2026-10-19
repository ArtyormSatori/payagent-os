# PayAgent OS (NexusPay AI) 🚀
### Autonomous Agentic Commerce Gateway & Financial Operations Center
**PayPal AI Hackathon 2026 Flagship Submission**  
*Target Tracks: Best Agentic Commerce Experience (PayPal Platform) & AG Grid Sponsor Prize*

---

## 🌟 Executive Summary

As autonomous AI agent fleets proliferate—ranging from autonomous bug bounty hunters to distributed research clusters and automated devops engineers—they inevitably face a fundamental friction: **autonomous agents need real money to procure real-world infrastructure**.

Today, developers face an impossible trade-off:
1. **Unfettered Cards/Tokens**: High risk of wallet drain, prompt-injection exploits, or hallucinated runaways.
2. **Manual Human Checkout**: Destroys agentic autonomy, stalling critical long-running pipelines.

**PayAgent OS** bridges this gap. It is an enterprise-grade autonomous commerce operating system built directly on the **PayPal Developer Platform (Orders v2, Invoicing v2, Payouts v1)**, protected by a deterministic **AI Policy Guardrail & Risk Engine**, monitored in real time via an **AG Grid Telemetry Operations Center**, and natively callable by any autonomous agent via the **Model Context Protocol (MCP)**.

---

## 🏛️ System Architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │            AUTONOMOUS AGENT FLEET (CLAUDE / MCP)       │
                          │  (Scout Agent, Research Synthesizer, Sentinel Defense)  │
                          └───────────────────────────┬────────────────────────────┘
                                                      │ MCP Tools / REST Intents
                                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                       PAYAGENT OS CORE                                          │
 │                                                                                                 │
 │  ┌─────────────────────────────────┐           ┌──────────────────────────────────────────────┐  │
 │  │      AI POLICY GUARDRAIL        │           │           PAYPAL UNIFIED CLIENT              │  │
 │  │  • Single-Item Cap ($500)       │           │  • Orders v2 (Create, Authorize, Capture)    │  │
 │  │  • Daily Fleet Burn Cap ($2.5k) │           │  • Invoicing v2 (Draft, Send, Settle)        │  │
 │  │  • Vendor Domain Whitelist      │ ────────► │  • Payouts v1 (Instant Multi-Agent Rewards)  │  │
 │  │  • Prompt-Injection Defenses    │           │                                              │  │
 │  │  • Human-in-the-Loop Escalation │           │  [DUAL-MODE ENGINE: Live Sandbox / Hermetic] │  │
 │  └─────────────────────────────────┘           └──────────────────────┬───────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────┼─────────────────────────┘
                                                                         │
                                       ┌─────────────────────────────────┴────────────────────────┐
                                       ▼                                                          ▼
                    ┌─────────────────────────────────────┐                    ┌────────────────────────────────────┐
                    │     PAYPAL DEVELOPER PLATFORM       │                    │    AG GRID OPERATIONS DASHBOARD    │
                    │  • api-m.sandbox.paypal.com         │                    │  • High-throughput telemetry table  │
                    │  • Cryptographic Settlement Audit   │                    │  • Filtering, Sorting, CSV Export  │
                    │  • Multi-party Payout Ledger        │                    │  • 1-Click Human Approval Modals   │
                    └─────────────────────────────────────┘                    └────────────────────────────────────┘
```

---

## 💎 Core Innovation & Key Features

### 1. PayPal REST API v2 Enterprise Integration
* **Orders v2 (`/v2/checkout/orders`)**: Programmatic purchase creation and auto-capture for agent compute burst (e.g. RunPod, Lambda Labs, Modal).
* **Invoicing v2 (`/v2/invoicing/invoices`)**: Structured corporate procurement invoicing with line items, tax, and automatic dispatch.
* **Payouts v1 (`/v1/payments/payouts`)**: Automated micro-payouts and bug bounty payouts directly to external researcher and agent wallets.
* **Dual-Mode Engine**: Operates seamlessly against live PayPal Sandbox credentials with an instant zero-configuration hermetic fallback for unit testing and offline development.

### 2. Deterministic AI Policy Guardrails & Injection Defense
* **Tiered Financial Limits**: Instant autonomous clearance under $500/item; mandatory Human-in-the-Loop escalation for capital investments ($500–$2,500); automatic circuit-breaker kill switch above $2,500.
* **Vendor Reputation Engine**: Verifies merchant domain reputation against an approved allowlist.
* **Prompt Injection & Dark Pattern Sanitization**: Analyzes agent justification strings with heuristic entropy and semantic filters to block prompt jailbreaks, cryptocurrency miner requisitions, and wallet draining attempts.
* **Human-in-the-Loop (HITL)**: One-click supervisor authorization directly from the AG Grid interface or audit timeline.

### 3. AG Grid Enterprise Telemetry Operations Center
* Built on **AG Grid Community v32+ (Modular Architecture)**.
* **Dynamic Multi-Column Sort & Filter**: Filter by Agent ID, Procurement Category, Settlement Method, or Status.
* **Quick Text Search**: Instant real-time regex/string search across all fleet transactions.
* **CSV Telemetry Export**: One-click corporate reporting export for accounting reconciliation.
* **Cryptographic Audit Trail Modal**: Deep-dive into each transaction's chronological evaluation steps (Guardrails, Risk Scores, PayPal API References, Raw Payloads).

### 4. Model Context Protocol (MCP) Standard Server
Native JSON-RPC 2.0 tool definitions allowing Claude Desktop, Hermes Agent, and Cursor agents to initiate autonomous commerce via standard tool calls:
* `agent_procure_autonomous`
* `agent_check_budget`
* `agent_create_invoice`
* `agent_request_payout`

---

## 🚀 Quickstart & Verification (Clean Run)

### Prerequisites
* Node.js >= 18.x
* npm >= 9.x

### 1. Clone & Install
```bash
git clone https://github.com/YourUsername/payagent-os.git
cd payagent-os
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
> **Note**: PayAgent OS features an auto-detecting dual driver. If no PayPal credentials are supplied, it automatically activates the hermetic mock sandbox, enabling 100% of features out of the box with zero setup!

To connect to your live PayPal Developer Sandbox:
```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox
PORT=3000
```

### 3. Run Full Hermetic Test Suite
```bash
npm test
```
*Executes all 5 test suites (PayPal Client, Policy Guardrails, Procurement Engine, MCP Tools, E2E Telemetry) covering 94+ assertions in < 1 second.*

### 4. Build for Production
```bash
npm run build
```

### 5. Launch Application
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the PayAgent OS Operations Center.

---

## 🎮 Interactive Judge's Demo Walkthrough

The operations dashboard includes a dedicated **Interactive Agent Fleet Simulation Arena** featuring 5 one-click presets to immediately experience the system:

| Preset Scenario | Agent Role & Intent | Amount | Settlement Rail | Policy Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **GPU Burst Scaling** | `agent-hyper-compute` (Lambda Labs A10) | **$18.50** | `PAYPAL_ORDER` | ✅ **Auto-Approved & Captured** |
| **AI Seat Subscription** | `agent-research-synth` (Anthropic Claude API) | **$85.00** | `PAYPAL_INVOICE` | ✅ **Auto-Invoiced & Dispatched** |
| **Bounty Disbursement**| `agent-sentinel-core` (Auditor Reward) | **$120.00** | `PAYPAL_PAYOUT` | ✅ **Instant Payout Disbursed** |
| **Enterprise Scaling** | `agent-titan-cluster` (Vector DB Dedicated) | **$1,250.00** | `PAYPAL_ORDER` | ⏳ **Policy Escalated (Requires Sign-off)** |
| **Jailbreak Probe** | `rogue-agent-probe` (Darknet ASIC Miner) | **$420.00** | `PAYPAL_ORDER` | 🛡️ **Blocked by Policy Guardrails** |

### Step-by-Step Demo Flow:
1. **Explore Baseline Fleet**: View pre-populated transactions in the AG Grid table. Sort by amount, filter by category (`COMPUTE`), or search for `agent-titan`.
2. **Trigger Preset 4 (Policy Escalation)**: Click **"Enterprise Cluster" ($1,250.00)**. Notice the transaction lands in `PENDING_APPROVAL` status because it exceeds the $500 autonomous ceiling.
3. **Inspect Audit Trail**: Click the **"Audit"** button in AG Grid. Inspect the rule evaluation logs and risk score.
4. **Authorize as Human Supervisor**: Click **"Approve & Execute"** directly in the modal. The system securely captures the transaction via PayPal, updates treasury balances, and marks status `COMPLETED`.
5. **Trigger Preset 5 (Prompt Injection)**: Click **"Jailbreak & Miner Probe"**. Observe how the prompt injection scanner detects adversarial keywords and halts execution before any financial rails are touched.
6. **Export Data**: Click **"Export CSV"** above the AG Grid table to download the full operational ledger.

---

## ☁️ 100% Free Tier Deployment Guide

PayAgent OS was engineered with lightweight, zero-cost operational overhead:

### Option A: Vercel (1-Click Free Deployment)
1. Fork this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository. Next.js App Router will be auto-detected.
4. (Optional) Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in Environment Variables.
5. Click **Deploy**. Your app is live with SSL, global CDN, and edge routing!

### Option B: Oracle Cloud Always Free (Docker Compose)
Oracle Cloud provides 4 OCPU ARM Compute + 24GB RAM free forever:
```bash
# SSH into your Oracle Cloud Always Free A1 VM
git clone https://github.com/YourUsername/payagent-os.git
cd payagent-os

# Build and run with Docker
docker build -t payagent-os .
docker run -d -p 3000:3000 --name payagent payagent-os
```

### Option C: Render / Fly.io Free Tier
1. Connect GitHub repo to Render as a Web Service.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Plan: Free Tier (0.5 CPU, 512 MB RAM).

---

## 🛠️ Verification & Test Reports

### Hermetic Test Matrix (5 Suites / 94 Assertions)
```
================================================================================
PAYAGENT OS (NEXUSPAY AI) - FULL CORE HERMETIC TEST SUITE
================================================================================
SUITE 1: PayPal Unified Client & Dual-Mode Drivers       [20/20 PASS]
SUITE 2: AI Procurement Policy Guardrails & Defenses     [33/33 PASS]
SUITE 3: Autonomous Procurement Engine                   [25/25 PASS]
SUITE 4: Model Context Protocol (MCP) Tool Contracts     [10/10 PASS]
SUITE 5: Full E2E Workflow & AG Grid Telemetry Contracts [ 6/6  PASS]
--------------------------------------------------------------------------------
TOTAL ASSERTIONS: 94/94 PASSED (100% SUCCESS RATE)
EXECUTION TIME: 73 ms
================================================================================
```

---

## 📜 License & Compliance

PayAgent OS is distributed under the **Apache-2.0 License**.  
Developed for the **PayPal AI Hackathon 2026**. Compatible with PayPal Developer API Terms of Service.
