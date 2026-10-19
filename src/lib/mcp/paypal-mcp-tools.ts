import { paypalClient } from "../paypal/client";
import { procurementEngine } from "../agent/procurement-engine";
import { ProcurementRequest } from "../agent/types";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

export const PAYPAL_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "paypal_create_order",
    description: "Create a PayPal order for agentic commerce purchase using PayPal REST API v2",
    inputSchema: {
      type: "object",
      properties: {
        amount: { type: "number", description: "The total payment amount" },
        currency: { type: "string", description: "3-letter currency code, e.g. USD", default: "USD" },
        description: { type: "string", description: "Purchase description" },
        referenceId: { type: "string", description: "Internal reference ID" },
      },
      required: ["amount", "description"],
    },
  },
  {
    name: "paypal_capture_order",
    description: "Capture payment for an approved PayPal order using PayPal REST API v2",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "The PayPal Order ID returned by paypal_create_order" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "paypal_create_invoice",
    description: "Draft and create a business invoice via PayPal Invoicing REST API v2",
    inputSchema: {
      type: "object",
      properties: {
        recipientEmail: { type: "string", description: "Client email address" },
        recipientName: { type: "string", description: "Client business name" },
        itemName: { type: "string", description: "Line item description" },
        quantity: { type: "number", description: "Quantity", default: 1 },
        unitPrice: { type: "number", description: "Price per unit" },
        currency: { type: "string", description: "Currency code", default: "USD" },
      },
      required: ["recipientEmail", "itemName", "unitPrice"],
    },
  },
  {
    name: "paypal_send_payout",
    description: "Disburse single or batch payout to another autonomous agent or freelancer via PayPal Payouts API v1",
    inputSchema: {
      type: "object",
      properties: {
        recipientEmail: { type: "string", description: "Recipient's PayPal email" },
        amount: { type: "number", description: "Payout amount" },
        currency: { type: "string", description: "Currency code", default: "USD" },
        note: { type: "string", description: "Transfer memo / note" },
      },
      required: ["recipientEmail", "amount"],
    },
  },
  {
    name: "paypal_check_balance",
    description: "Retrieve current available and pending balances for the PayPal merchant account",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "agent_procure_autonomous",
    description: "Submit an autonomous procurement intent through PayAgent OS Policy Guardrails and execute settlement",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Calling agent identifier" },
        agentRole: { type: "string", description: "Role of the requesting agent" },
        category: {
          type: "string",
          enum: ["COMPUTE", "DATASET", "API_SUBSCRIPTION", "CLOUD_HOSTING", "HARDWARE", "CONSULTING"],
        },
        itemName: { type: "string", description: "Product or service name" },
        quantity: { type: "number", default: 1 },
        unitPrice: { type: "number" },
        vendorName: { type: "string", description: "Vendor name" },
        vendorDomain: { type: "string", description: "Vendor domain name, e.g. aws.amazon.com" },
        vendorEmail: { type: "string", description: "Vendor email" },
        paymentMethod: {
          type: "string",
          enum: ["PAYPAL_ORDER", "PAYPAL_INVOICE", "PAYPAL_PAYOUT"],
          default: "PAYPAL_ORDER",
        },
        justification: { type: "string", description: "Operational reasoning for purchase" },
      },
      required: ["agentId", "category", "itemName", "unitPrice", "vendorName", "justification"],
    },
  },
];

export async function executeMcpTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case "paypal_create_order": {
      return await paypalClient.createOrder({
        amount: {
          currencyCode: args.currency || "USD",
          value: args.amount,
        },
        description: args.description,
        referenceId: args.referenceId,
      });
    }

    case "paypal_capture_order": {
      return await paypalClient.captureOrder(args.orderId);
    }

    case "paypal_create_invoice": {
      const invoice = await paypalClient.createInvoice({
        recipientEmail: args.recipientEmail,
        recipientName: args.recipientName,
        currencyCode: args.currency || "USD",
        items: [
          {
            name: args.itemName,
            quantity: args.quantity || 1,
            unitPrice: args.unitPrice,
          },
        ],
      });
      return invoice;
    }

    case "paypal_send_payout": {
      return await paypalClient.createPayout({
        recipientEmail: args.recipientEmail,
        amount: args.amount,
        currencyCode: args.currency || "USD",
        note: args.note,
      });
    }

    case "paypal_check_balance": {
      return await paypalClient.getBalance();
    }

    case "agent_procure_autonomous": {
      const req: ProcurementRequest = {
        id: `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        agentId: args.agentId,
        agentRole: args.agentRole || "Autonomous Subagent",
        category: args.category,
        item: {
          name: args.itemName,
          quantity: args.quantity || 1,
          unitPrice: args.unitPrice,
          totalAmount: Number(((args.quantity || 1) * args.unitPrice).toFixed(2)),
          currency: "USD",
        },
        vendor: {
          name: args.vendorName,
          domain: args.vendorDomain,
          recipientEmail: args.vendorEmail,
        },
        paymentMethod: args.paymentMethod || "PAYPAL_ORDER",
        justification: args.justification,
        urgency: "MEDIUM",
        createdTime: new Date().toISOString(),
      };

      return await procurementEngine.submitAndExecute(req);
    }

    default:
      throw new Error(`Unknown MCP tool name: ${name}`);
  }
}
