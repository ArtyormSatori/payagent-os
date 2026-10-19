import { config } from "../../config/env";
import { MockPayPalDriver } from "./mock-driver";
import { RealPayPalDriver } from "./real-driver";
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

export class PayPalUnifiedClient {
  private driver: IPayPalDriver;

  constructor(preferredMode?: "sandbox" | "mock") {
    const activeMode = preferredMode || config.paypal.mode;

    if (activeMode === "sandbox" && config.paypal.isRealSandbox) {
      this.driver = new RealPayPalDriver(
        config.paypal.clientId,
        config.paypal.clientSecret,
        config.paypal.apiBaseUrl
      );
    } else {
      this.driver = new MockPayPalDriver(config.paypal.mockLatencyMs);
    }
  }

  getDriverInfo(): {
    mode: "sandbox" | "mock";
    isRealSandbox: boolean;
    credentialsWaitingPoint: string;
    apiBaseUrl: string;
  } {
    return {
      mode: this.driver.name,
      isRealSandbox: this.driver.name === "sandbox",
      credentialsWaitingPoint: config.paypal.credentialsWaitingPoint,
      apiBaseUrl: config.paypal.apiBaseUrl,
    };
  }

  setDriver(driver: IPayPalDriver) {
    this.driver = driver;
  }

  async createOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
    return await this.driver.createOrder(params);
  }

  async getOrder(orderId: string): Promise<PayPalOrderResponse> {
    return await this.driver.getOrder(orderId);
  }

  async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    return await this.driver.captureOrder(orderId);
  }

  async createInvoice(params: CreateInvoiceParams): Promise<PayPalInvoiceResponse> {
    return await this.driver.createInvoice(params);
  }

  async sendInvoice(invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: InvoiceStatus }> {
    return await this.driver.sendInvoice(invoiceId);
  }

  async createPayout(params: CreatePayoutParams): Promise<PayPalPayoutResponse> {
    return await this.driver.createPayout(params);
  }

  async getBalance(): Promise<{ currency: string; available: number; pending: number }> {
    return await this.driver.getBalance();
  }
}

export const paypalClient = new PayPalUnifiedClient();
