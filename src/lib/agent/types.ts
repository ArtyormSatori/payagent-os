export type AgentCategory =
  | "COMPUTE"
  | "DATASET"
  | "API_SUBSCRIPTION"
  | "CLOUD_HOSTING"
  | "HARDWARE"
  | "CONSULTING";

export type PaymentMethod = "PAYPAL_ORDER" | "PAYPAL_INVOICE" | "PAYPAL_PAYOUT";

export type DecisionAction = "APPROVE" | "ESCALATE_TO_HUMAN" | "REJECT";

export interface ProcurementItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  description?: string;
  sku?: string;
}

export interface ProcurementVendor {
  name: string;
  domain?: string;
  recipientEmail?: string;
  country?: string;
}

export interface ProcurementRequest {
  id: string;
  agentId: string;
  agentRole: string;
  category: AgentCategory;
  item: ProcurementItem;
  vendor: ProcurementVendor;
  paymentMethod: PaymentMethod;
  justification: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  createdTime: string;
  metadata?: Record<string, any>;
}

export interface GuardrailCheckResult {
  passed: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface GuardrailEvaluation {
  budgetCheck: GuardrailCheckResult & { limit: number; requested: number };
  dailyCapCheck: GuardrailCheckResult & { dailyUsed: number; dailyLimit: number };
  vendorCheck: GuardrailCheckResult & { trustLevel: "WHITELISTED" | "NEUTRAL" | "SUSPICIOUS" | "BLOCKED" };
  securityScan: GuardrailCheckResult & { promptInjectionDetected: boolean; flags: string[] };
}

export interface PolicyDecision {
  action: DecisionAction;
  confidence: number;
  reasons: string[];
  guardrails: GuardrailEvaluation;
  requiresHumanApproval: boolean;
  suggestedActionPlan: string;
}

export interface AuditLogEntry {
  step: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface ProcurementExecutionResult {
  requestId: string;
  transactionId: string;
  decision: PolicyDecision;
  status: "COMPLETED" | "PENDING_APPROVAL" | "REJECTED" | "FAILED";
  paymentMethod: PaymentMethod;
  paymentReferenceId?: string;
  amount: number;
  currency: string;
  timestamp: string;
  auditTrail: AuditLogEntry[];
  rawPaymentResponse?: any;
}
