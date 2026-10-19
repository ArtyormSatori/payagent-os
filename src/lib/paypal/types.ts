export type OrderIntent = "CAPTURE" | "AUTHORIZE";
export type OrderStatus = "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
export type InvoiceStatus = "DRAFT" | "SENT" | "SCHEDULED" | "PAID" | "MARKED_AS_PAID" | "CANCELLED" | "REFUNDED";
export type PayoutStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "DENIED" | "CANCELED";

export interface Money {
  currency_code: string;
  value: string;
}

export interface PurchaseUnitItem {
  name: string;
  quantity: string;
  unit_amount: Money;
  description?: string;
  sku?: string;
  category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
}

export interface CreateOrderParams {
  referenceId?: string;
  description?: string;
  amount: {
    currencyCode: string;
    value: number | string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    description?: string;
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS";
  }>;
  customId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: OrderStatus;
  intent: OrderIntent;
  create_time: string;
  update_time?: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  purchase_units: Array<{
    reference_id: string;
    amount: Money;
    description?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: "COMPLETED" | "DECLINED" | "PARTIALLY_REFUNDED" | "PENDING" | "REFUNDED";
        amount: Money;
        final_capture: boolean;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
}

export interface CaptureOrderResponse {
  id: string;
  status: "COMPLETED" | "DECLINED" | "FAILED" | "PENDING";
  payment_source?: {
    paypal?: {
      email_address?: string;
      account_id?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
  };
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: "COMPLETED" | "DECLINED" | "PENDING";
        amount: Money;
        final_capture: boolean;
        seller_protection?: {
          status: string;
        };
        create_time: string;
      }>;
    };
  }>;
}

export interface CreateInvoiceParams {
  recipientEmail: string;
  recipientName?: string;
  currencyCode?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }>;
  note?: string;
  term?: string;
}

export interface PayPalInvoiceResponse {
  id: string;
  invoice_number: string;
  status: InvoiceStatus;
  invoice_date: string;
  due_date: string;
  primary_recipients: Array<{
    billing_info: {
      email_address: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
  }>;
  amount: {
    currency_code: string;
    value: string;
  };
  detail: {
    note?: string;
    term?: string;
    currency_code: string;
  };
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CreatePayoutParams {
  recipientEmail: string;
  amount: number | string;
  currencyCode?: string;
  note?: string;
  senderItemId?: string;
}

export interface PayPalPayoutResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: PayoutStatus;
    sender_batch_header: {
      sender_batch_id: string;
      email_subject?: string;
    };
    amount: Money;
    time_created: string;
    time_completed?: string;
  };
  items: Array<{
    payout_item_id: string;
    transaction_id?: string;
    transaction_status: PayoutStatus;
    payout_item_fee?: Money;
    payout_batch_id: string;
    payout_item: {
      recipient_type: "EMAIL";
      amount: Money;
      note?: string;
      receiver: string;
      sender_item_id?: string;
    };
  }>;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface WebhookEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: Record<string, any>;
}

export interface IPayPalDriver {
  name: "sandbox" | "mock";
  createOrder(params: CreateOrderParams): Promise<PayPalOrderResponse>;
  getOrder(orderId: string): Promise<PayPalOrderResponse>;
  captureOrder(orderId: string): Promise<CaptureOrderResponse>;
  createInvoice(params: CreateInvoiceParams): Promise<PayPalInvoiceResponse>;
  sendInvoice(invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: InvoiceStatus }>;
  createPayout(params: CreatePayoutParams): Promise<PayPalPayoutResponse>;
  getBalance(): Promise<{ currency: string; available: number; pending: number }>;
}
