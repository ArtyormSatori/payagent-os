import { paypalClient } from "../paypal/client";
import { PolicyGuardrails } from "./policy-guardrails";
import {
  ProcurementRequest,
  ProcurementExecutionResult,
  AuditLogEntry,
  PaymentMethod,
} from "./types";

function generateTxId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TX-NEXUS-${ts}-${rand}`;
}

export class ProcurementEngine {
  private requests: Map<string, ProcurementRequest> = new Map();
  private executions: Map<string, ProcurementExecutionResult> = new Map();
  private pendingQueue: Map<string, ProcurementRequest> = new Map();
  private dailySpend: number = 0;
  private lastResetDate: string = new Date().toISOString().split("T")[0];

  private checkAndResetDailySpend() {
    const today = new Date().toISOString().split("T")[0];
    if (today !== this.lastResetDate) {
      this.dailySpend = 0;
      this.lastResetDate = today;
    }
  }

  getCurrentDailySpend(): number {
    this.checkAndResetDailySpend();
    return this.dailySpend;
  }

  async submitAndExecute(request: ProcurementRequest): Promise<ProcurementExecutionResult> {
    this.checkAndResetDailySpend();
    const txId = generateTxId();
    const auditTrail: AuditLogEntry[] = [];

    const logStep = (step: string, details: Record<string, any>) => {
      auditTrail.push({
        step,
        timestamp: new Date().toISOString(),
        details,
      });
    };

    logStep("REQUEST_RECEIVED", {
      requestId: request.id,
      agentId: request.agentId,
      category: request.category,
      amount: request.item.totalAmount,
      vendor: request.vendor.name,
    });

    this.requests.set(request.id, request);

    // 1. Run Policy Guardrail Evaluation
    const decision = PolicyGuardrails.evaluate(request, this.dailySpend);
    logStep("POLICY_EVALUATION", {
      action: decision.action,
      confidence: decision.confidence,
      reasons: decision.reasons,
      guardrails: {
        budgetPassed: decision.guardrails.budgetCheck.passed,
        dailyCapPassed: decision.guardrails.dailyCapCheck.passed,
        vendorPassed: decision.guardrails.vendorCheck.passed,
        securityPassed: decision.guardrails.securityScan.passed,
      },
    });

    // 2. Branch: REJECT
    if (decision.action === "REJECT") {
      logStep("EXECUTION_ABORTED_REJECTED", {
        reason: decision.reasons.join(" | "),
      });

      const result: ProcurementExecutionResult = {
        requestId: request.id,
        transactionId: txId,
        decision,
        status: "REJECTED",
        paymentMethod: request.paymentMethod,
        amount: request.item.totalAmount,
        currency: request.item.currency,
        timestamp: new Date().toISOString(),
        auditTrail,
      };

      this.executions.set(request.id, result);
      return result;
    }

    // 3. Branch: ESCALATE_TO_HUMAN
    if (decision.action === "ESCALATE_TO_HUMAN") {
      this.pendingQueue.set(request.id, request);
      logStep("ESCALATED_TO_HUMAN_APPROVAL", {
        reasons: decision.reasons,
        actionPlan: decision.suggestedActionPlan,
      });

      const result: ProcurementExecutionResult = {
        requestId: request.id,
        transactionId: txId,
        decision,
        status: "PENDING_APPROVAL",
        paymentMethod: request.paymentMethod,
        amount: request.item.totalAmount,
        currency: request.item.currency,
        timestamp: new Date().toISOString(),
        auditTrail,
      };

      this.executions.set(request.id, result);
      return result;
    }

    // 4. Branch: APPROVE -> Execute via PayPal REST APIs
    try {
      logStep("PAYPAL_DISPATCH_INITIATED", {
        paymentMethod: request.paymentMethod,
      });

      let rawPaymentResponse: any = null;
      let paymentRefId = "";

      if (request.paymentMethod === "PAYPAL_ORDER") {
        // Step A: Create PayPal Order
        const order = await paypalClient.createOrder({
          referenceId: request.id,
          description: `PayAgent: ${request.item.name} (${request.agentId})`,
          amount: {
            currencyCode: request.item.currency,
            value: request.item.totalAmount,
          },
          items: [
            {
              name: request.item.name,
              quantity: request.item.quantity,
              unitPrice: request.item.unitPrice,
              description: request.item.description,
            },
          ],
          customId: txId,
        });

        logStep("PAYPAL_ORDER_CREATED", { orderId: order.id, status: order.status });

        // Step B: Capture PayPal Order (Autonomous Agent settlement)
        const capture = await paypalClient.captureOrder(order.id);
        rawPaymentResponse = capture;
        paymentRefId = order.id;

        logStep("PAYPAL_ORDER_CAPTURED", {
          orderId: order.id,
          captureStatus: capture.status,
          captures: capture.purchase_units[0]?.payments?.captures,
        });

        this.dailySpend += request.item.totalAmount;
      } else if (request.paymentMethod === "PAYPAL_INVOICE") {
        const recipientEmail = request.vendor.recipientEmail || "billing@" + (request.vendor.domain || "vendor.com");
        const invoice = await paypalClient.createInvoice({
          recipientEmail,
          recipientName: request.vendor.name,
          currencyCode: request.item.currency,
          items: [
            {
              name: request.item.name,
              quantity: request.item.quantity,
              unitPrice: request.item.unitPrice,
              description: request.item.description,
            },
          ],
          note: `PayAgent Automated Invoice for PO ${request.id}`,
        });

        logStep("PAYPAL_INVOICE_CREATED", { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number });

        const sendResult = await paypalClient.sendInvoice(invoice.id);
        rawPaymentResponse = { invoice, sendResult };
        paymentRefId = invoice.id;

        logStep("PAYPAL_INVOICE_SENT", { invoiceId: invoice.id, status: sendResult.status });
      } else if (request.paymentMethod === "PAYPAL_PAYOUT") {
        const recipientEmail = request.vendor.recipientEmail || "settlement@" + (request.vendor.domain || "vendor.com");
        const payout = await paypalClient.createPayout({
          recipientEmail,
          amount: request.item.totalAmount,
          currencyCode: request.item.currency,
          note: `Autonomous agent payment for ${request.item.name}`,
          senderItemId: request.id,
        });

        rawPaymentResponse = payout;
        paymentRefId = payout.batch_header.payout_batch_id;

        logStep("PAYPAL_PAYOUT_DISPATCHED", {
          batchId: payout.batch_header.payout_batch_id,
          status: payout.batch_header.batch_status,
        });

        this.dailySpend += request.item.totalAmount;
      }

      const result: ProcurementExecutionResult = {
        requestId: request.id,
        transactionId: txId,
        decision,
        status: "COMPLETED",
        paymentMethod: request.paymentMethod,
        paymentReferenceId: paymentRefId,
        amount: request.item.totalAmount,
        currency: request.item.currency,
        timestamp: new Date().toISOString(),
        auditTrail,
        rawPaymentResponse,
      };

      this.executions.set(request.id, result);
      return result;
    } catch (err: any) {
      logStep("PAYPAL_EXECUTION_FAILED", { error: err.message });
      const result: ProcurementExecutionResult = {
        requestId: request.id,
        transactionId: txId,
        decision,
        status: "FAILED",
        paymentMethod: request.paymentMethod,
        amount: request.item.totalAmount,
        currency: request.item.currency,
        timestamp: new Date().toISOString(),
        auditTrail,
        rawPaymentResponse: { error: err.message },
      };
      this.executions.set(request.id, result);
      return result;
    }
  }

  async approveEscalated(requestId: string, humanApprover: string): Promise<ProcurementExecutionResult> {
    const request = this.pendingQueue.get(requestId);
    if (!request) {
      throw new Error(`Pending request not found for escalation: ${requestId}`);
    }

    this.pendingQueue.delete(requestId);
    const existing = this.executions.get(requestId);

    const auditTrail = existing?.auditTrail || [];
    auditTrail.push({
      step: "HUMAN_APPROVAL_GRANTED",
      timestamp: new Date().toISOString(),
      details: { approver: humanApprover, notes: "Managerial override / confirmation granted" },
    });

    // Execute order
    const order = await paypalClient.createOrder({
      referenceId: request.id,
      description: `[APPROVED] ${request.item.name}`,
      amount: {
        currencyCode: request.item.currency,
        value: request.item.totalAmount,
      },
      customId: existing?.transactionId || generateTxId(),
    });

    const capture = await paypalClient.captureOrder(order.id);
    this.dailySpend += request.item.totalAmount;

    auditTrail.push({
      step: "PAYPAL_ORDER_CAPTURED_POST_APPROVAL",
      timestamp: new Date().toISOString(),
      details: { orderId: order.id, captureStatus: capture.status },
    });

    const result: ProcurementExecutionResult = {
      requestId: request.id,
      transactionId: existing?.transactionId || generateTxId(),
      decision: existing?.decision || PolicyGuardrails.evaluate(request, 0),
      status: "COMPLETED",
      paymentMethod: request.paymentMethod,
      paymentReferenceId: order.id,
      amount: request.item.totalAmount,
      currency: request.item.currency,
      timestamp: new Date().toISOString(),
      auditTrail,
      rawPaymentResponse: capture,
    };

    this.executions.set(requestId, result);
    return result;
  }

  getTelemetrySummary() {
    this.checkAndResetDailySpend();
    const all = Array.from(this.executions.values());
    const completed = all.filter((e) => e.status === "COMPLETED");
    const rejected = all.filter((e) => e.status === "REJECTED");
    const pending = all.filter((e) => e.status === "PENDING_APPROVAL");
    const failed = all.filter((e) => e.status === "FAILED");

    const totalSpend = completed.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalRequests: all.length,
      completedCount: completed.length,
      rejectedCount: rejected.length,
      pendingApprovalCount: pending.length,
      failedCount: failed.length,
      totalSpend: Number(totalSpend.toFixed(2)),
      dailySpend: Number(this.dailySpend.toFixed(2)),
      activeDriver: paypalClient.getDriverInfo(),
      recentTransactions: all.slice(-10).reverse(),
    };
  }

  getAllExecutions(): ProcurementExecutionResult[] {
    return Array.from(this.executions.values());
  }

  getPendingRequests(): ProcurementRequest[] {
    return Array.from(this.pendingQueue.values());
  }
}

export const procurementEngine = new ProcurementEngine();
