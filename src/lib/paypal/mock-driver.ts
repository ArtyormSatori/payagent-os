import {
  IPayPalDriver,
  CreateOrderParams,
  PayPalOrderResponse,
  CaptureOrderResponse,
  CreateInvoiceParams,
  PayPalInvoiceResponse,
  CreatePayoutParams,
  PayPalPayoutResponse,
  InvoiceStatus,
  OrderStatus,
} from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomHex(len: number): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export class MockPayPalDriver implements IPayPalDriver {
  public readonly name = "mock" as const;
  private latencyMs: number;

  private orders: Map<string, PayPalOrderResponse> = new Map();
  private invoices: Map<string, PayPalInvoiceResponse> = new Map();
  private payouts: Map<string, PayPalPayoutResponse> = new Map();
  private invoiceCounter = 1001;
  private mockBalance = { currency: "USD", available: 12500.0, pending: 0.0 };

  constructor(latencyMs: number = 50) {
    this.latencyMs = latencyMs;
  }

  async createOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);

    const val = typeof params.amount.value === "number" ? params.amount.value.toFixed(2) : params.amount.value;
    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal <= 0) {
      throw new Error(`[MockPayPalDriver] Invalid order amount: ${val}`);
    }

    const orderId = `ORD-MOCK-${randomHex(14)}`;
    const now = new Date().toISOString();

    const order: PayPalOrderResponse = {
      id: orderId,
      status: "CREATED",
      intent: "CAPTURE",
      create_time: now,
      links: [
        {
          href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
          rel: "self",
          method: "GET",
        },
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
          rel: "approve",
          method: "GET",
        },
        {
          href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
          rel: "capture",
          method: "POST",
        },
      ],
      purchase_units: [
        {
          reference_id: params.referenceId || "default_unit",
          amount: {
            currency_code: params.amount.currencyCode || "USD",
            value: val,
          },
          description: params.description || "Agentic Autonomous Procurement Purchase",
          custom_id: params.customId || "AGENT-TXN-" + randomHex(8),
        },
      ],
    };

    this.orders.set(orderId, order);
    return order;
  }

  async getOrder(orderId: string): Promise<PayPalOrderResponse> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`[MockPayPalDriver] Order not found: ${orderId}`);
    }
    return order;
  }

  async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`[MockPayPalDriver] Order not found for capture: ${orderId}`);
    }

    if (order.status === "COMPLETED") {
      throw new Error(`[MockPayPalDriver] Order already captured: ${orderId}`);
    }

    order.status = "COMPLETED";
    order.update_time = new Date().toISOString();

    const captureId = `CAP-MOCK-${randomHex(14)}`;
    const unit = order.purchase_units[0];
    const captureObj = {
      id: captureId,
      status: "COMPLETED" as const,
      amount: unit.amount,
      final_capture: true,
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };

    unit.payments = {
      captures: [captureObj],
    };

    // Deduct from mock balance if applicable
    const amountVal = parseFloat(unit.amount.value);
    this.mockBalance.available = Math.max(0, this.mockBalance.available - amountVal);

    return {
      id: orderId,
      status: "COMPLETED",
      payment_source: {
        paypal: {
          email_address: "agent-buyer@sandbox.nexuspay.ai",
          account_id: "ACCT-MOCK-BUYER",
          name: {
            given_name: "NexusPay",
            surname: "ProcurementAgent",
          },
        },
      },
      purchase_units: [
        {
          reference_id: unit.reference_id,
          payments: {
            captures: [
              {
                id: captureId,
                status: "COMPLETED",
                amount: unit.amount,
                final_capture: true,
                seller_protection: {
                  status: "ELIGIBLE",
                },
                create_time: captureObj.create_time,
              },
            ],
          },
        },
      ],
    };
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PayPalInvoiceResponse> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);

    const invoiceId = `INV2-MOCK-${randomHex(12)}`;
    const invoiceNumber = `INV-${this.invoiceCounter++}`;
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const total = params.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice: PayPalInvoiceResponse = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      status: "DRAFT",
      invoice_date: now.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      primary_recipients: [
        {
          billing_info: {
            email_address: params.recipientEmail,
            name: {
              given_name: params.recipientName || "Enterprise Client",
            },
          },
        },
      ],
      amount: {
        currency_code: params.currencyCode || "USD",
        value: total.toFixed(2),
      },
      detail: {
        note: params.note || "Automated invoice issued by PayAgent OS",
        term: params.term || "NET_14",
        currency_code: params.currencyCode || "USD",
      },
      links: [
        {
          href: `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoiceId}`,
          rel: "self",
          method: "GET",
        },
        {
          href: `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoiceId}/send`,
          rel: "send",
          method: "POST",
        },
      ],
    };

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  async sendInvoice(invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: InvoiceStatus }> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`[MockPayPalDriver] Invoice not found: ${invoiceId}`);
    }
    invoice.status = "SENT";
    return {
      success: true,
      invoiceId,
      status: "SENT",
    };
  }

  async createPayout(params: CreatePayoutParams): Promise<PayPalPayoutResponse> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);

    const batchId = `PAYOUT-BATCH-${randomHex(12)}`;
    const itemId = `ITEM-${randomHex(10)}`;
    const txId = `TX-${randomHex(14)}`;
    const amountVal = typeof params.amount === "number" ? params.amount.toFixed(2) : params.amount;
    const now = new Date().toISOString();

    const payout: PayPalPayoutResponse = {
      batch_header: {
        payout_batch_id: batchId,
        batch_status: "SUCCESS",
        sender_batch_header: {
          sender_batch_id: `SBATCH-${Date.now()}`,
          email_subject: "Autonomous Agent Settlement",
        },
        amount: {
          currency_code: params.currencyCode || "USD",
          value: amountVal,
        },
        time_created: now,
        time_completed: now,
      },
      items: [
        {
          payout_item_id: itemId,
          transaction_id: txId,
          transaction_status: "SUCCESS",
          payout_batch_id: batchId,
          payout_item_fee: {
            currency_code: params.currencyCode || "USD",
            value: "0.25",
          },
          payout_item: {
            recipient_type: "EMAIL",
            amount: {
              currency_code: params.currencyCode || "USD",
              value: amountVal,
            },
            note: params.note || "Autonomous subagent payment settlement",
            receiver: params.recipientEmail,
            sender_item_id: params.senderItemId || `SITEM-${randomHex(6)}`,
          },
        },
      ],
      links: [
        {
          href: `https://api-m.sandbox.paypal.com/v1/payments/payouts/${batchId}`,
          rel: "self",
          method: "GET",
        },
      ],
    };

    this.payouts.set(batchId, payout);
    return payout;
  }

  async getBalance(): Promise<{ currency: string; available: number; pending: number }> {
    if (this.latencyMs > 0) await sleep(this.latencyMs);
    return { ...this.mockBalance };
  }
}
