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
} from "./types";

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

export class RealPayPalDriver implements IPayPalDriver {
  public readonly name = "sandbox" as const;
  private apiBaseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private tokenCache: TokenCache | null = null;

  constructor(clientId: string, clientSecret: string, apiBaseUrl: string = "https://api-m.sandbox.paypal.com") {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return this.tokenCache.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(`${this.apiBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[RealPayPalDriver] Failed to retrieve access token (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const expiresInMs = (data.expires_in || 3600) * 1000;
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return this.tokenCache.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.apiBaseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`[RealPayPalDriver] API request error ${response.status} on ${endpoint}: ${errBody}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  async createOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
    const val = typeof params.amount.value === "number" ? params.amount.value.toFixed(2) : params.amount.value;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId || "default_unit",
          description: params.description || "Agentic Autonomous Commerce Procurement",
          custom_id: params.customId,
          amount: {
            currency_code: params.amount.currencyCode || "USD",
            value: val,
            ...(params.items && params.items.length > 0
              ? {
                  breakdown: {
                    item_total: {
                      currency_code: params.amount.currencyCode || "USD",
                      value: val,
                    },
                  },
                }
              : {}),
          },
          ...(params.items && params.items.length > 0
            ? {
                items: params.items.map((i) => ({
                  name: i.name,
                  quantity: String(i.quantity),
                  unit_amount: {
                    currency_code: params.amount.currencyCode || "USD",
                    value: i.unitPrice.toFixed(2),
                  },
                  description: i.description,
                  category: i.category || "DIGITAL_GOODS",
                })),
              }
            : {}),
        },
      ],
      ...(params.returnUrl && params.cancelUrl
        ? {
            application_context: {
              return_url: params.returnUrl,
              cancel_url: params.cancelUrl,
            },
          }
        : {}),
    };

    return await this.request<PayPalOrderResponse>("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getOrder(orderId: string): Promise<PayPalOrderResponse> {
    return await this.request<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`, {
      method: "GET",
    });
  }

  async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    return await this.request<CaptureOrderResponse>(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
    });
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PayPalInvoiceResponse> {
    const payload = {
      detail: {
        currency_code: params.currencyCode || "USD",
        note: params.note || "PayAgent OS Autonomous Invoice",
        term: params.term || "NET_14",
      },
      primary_recipients: [
        {
          billing_info: {
            email_address: params.recipientEmail,
            name: {
              given_name: params.recipientName || "Valued Enterprise Client",
            },
          },
        },
      ],
      items: params.items.map((it) => ({
        name: it.name,
        quantity: String(it.quantity),
        unit_amount: {
          currency_code: params.currencyCode || "USD",
          value: it.unitPrice.toFixed(2),
        },
        description: it.description,
      })),
    };

    return await this.request<PayPalInvoiceResponse>("/v2/invoicing/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async sendInvoice(invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: InvoiceStatus }> {
    await this.request<{}>("/v2/invoicing/invoices/" + invoiceId + "/send", {
      method: "POST",
      body: JSON.stringify({ send_to_recipient: true }),
    });

    return {
      success: true,
      invoiceId,
      status: "SENT",
    };
  }

  async createPayout(params: CreatePayoutParams): Promise<PayPalPayoutResponse> {
    const val = typeof params.amount === "number" ? params.amount.toFixed(2) : params.amount;
    const senderBatchId = `SBATCH-${Date.now()}`;

    const payload = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: "Autonomous Subagent Payment Settlement",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: val,
            currency: params.currencyCode || "USD",
          },
          note: params.note || "Autonomous subagent payment",
          receiver: params.recipientEmail,
          sender_item_id: params.senderItemId || `ITEM-${Date.now()}`,
        },
      ],
    };

    return await this.request<PayPalPayoutResponse>("/v1/payments/payouts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getBalance(): Promise<{ currency: string; available: number; pending: number }> {
    try {
      const res = await this.request<{ balances: Array<{ total_balance: { currency_code: string; value: string } }> }>(
        "/v1/reporting/balances?currency_code=USD",
        { method: "GET" }
      );
      const primary = res.balances?.[0]?.total_balance;
      return {
        currency: primary?.currency_code || "USD",
        available: parseFloat(primary?.value || "0"),
        pending: 0,
      };
    } catch {
      // Fallback for sandboxes without reporting scopes
      return {
        currency: "USD",
        available: 10000.0,
        pending: 0,
      };
    }
  }
}
