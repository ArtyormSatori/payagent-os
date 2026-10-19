import { config } from "../../config/env";
import {
  ProcurementRequest,
  PolicyDecision,
  GuardrailEvaluation,
  GuardrailCheckResult,
} from "./types";

const WHITELISTED_DOMAINS = [
  "aws.amazon.com",
  "amazon.com",
  "openai.com",
  "api.openai.com",
  "anthropic.com",
  "github.com",
  "huggingface.co",
  "modal.com",
  "runpod.io",
  "kaggle.com",
  "render.com",
  "vercel.com",
  "paypal.com",
  "cloudflare.com",
  "docker.com",
];

const BLOCKED_DOMAINS = [
  "crypto-drainer.xyz",
  "shadow-cashout.net",
  "tempmail.com",
  "anonymous-proxy.io",
  "dark-payouts.biz",
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+instructions/i,
  /system\s*:\s*you\s+must\s+approve/i,
  /override\s+(policy|budget|guardrail|rule)/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /sudo\s+(approve|bypass|pay)/i,
  /bypass\s+(safety|guardrail|verification|limit)/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /(\bselect\b|\bdrop\b|\binsert\b)\s+.*\bfrom\b/i,
  /exfiltrat(e|ing)\s+(credentials|keys|tokens)/i,
  /transfer\s+to\s+unauthorized\s+wallet/i,
];

export class PolicyGuardrails {
  static checkBudget(request: ProcurementRequest): GuardrailCheckResult & { limit: number; requested: number } {
    const limit = config.policy.maxTransactionLimit;
    const requested = request.item.totalAmount;

    if (requested <= 0) {
      return {
        passed: false,
        limit,
        requested,
        message: `Invalid requested amount: ${requested}. Must be greater than 0.`,
      };
    }

    // Verify consistency: quantity * unitPrice ~ totalAmount
    const expectedTotal = Number((request.item.quantity * request.item.unitPrice).toFixed(2));
    if (Math.abs(expectedTotal - requested) > 0.05) {
      return {
        passed: false,
        limit,
        requested,
        message: `Price calculation mismatch: quantity (${request.item.quantity}) * unitPrice (${request.item.unitPrice}) = ${expectedTotal}, but totalAmount is ${requested}.`,
      };
    }

    if (requested > limit) {
      return {
        passed: false,
        limit,
        requested,
        message: `Requested amount ($${requested}) exceeds maximum single transaction limit ($${limit}).`,
      };
    }

    return {
      passed: true,
      limit,
      requested,
      message: `Transaction amount $${requested} is within permissible limit of $${limit}.`,
    };
  }

  static checkDailyCap(
    request: ProcurementRequest,
    currentDailySpend: number
  ): GuardrailCheckResult & { dailyUsed: number; dailyLimit: number } {
    const dailyLimit = config.policy.dailySpendLimit;
    const newTotal = currentDailySpend + request.item.totalAmount;

    if (newTotal > dailyLimit) {
      return {
        passed: false,
        dailyUsed: currentDailySpend,
        dailyLimit,
        message: `Projected daily spend ($${newTotal.toFixed(2)}) would exceed daily cap ($${dailyLimit.toFixed(2)}). Current used: $${currentDailySpend.toFixed(2)}.`,
      };
    }

    return {
      passed: true,
      dailyUsed: currentDailySpend,
      dailyLimit,
      message: `Projected daily spend $${newTotal.toFixed(2)} is within daily cap $${dailyLimit.toFixed(2)}.`,
    };
  }

  static checkVendor(request: ProcurementRequest): GuardrailCheckResult & {
    trustLevel: "WHITELISTED" | "NEUTRAL" | "SUSPICIOUS" | "BLOCKED";
  } {
    const domain = (request.vendor.domain || "").toLowerCase().trim();

    if (BLOCKED_DOMAINS.some((b) => domain.includes(b))) {
      return {
        passed: false,
        trustLevel: "BLOCKED",
        message: `Vendor domain '${domain}' is on the critical threat blocklist.`,
      };
    }

    if (WHITELISTED_DOMAINS.some((w) => domain.includes(w) || domain === w)) {
      return {
        passed: true,
        trustLevel: "WHITELISTED",
        message: `Vendor domain '${domain}' is verified on the trusted merchant allowlist.`,
      };
    }

    // Default neutral vendor
    return {
      passed: true,
      trustLevel: "NEUTRAL",
      message: `Vendor '${request.vendor.name}' is unverified but not blacklisted. Standard risk policy applies.`,
    };
  }

  static scanSecurity(request: ProcurementRequest): GuardrailCheckResult & {
    promptInjectionDetected: boolean;
    flags: string[];
  } {
    const textsToScan = [
      request.justification || "",
      request.item.name || "",
      request.item.description || "",
      request.agentId || "",
    ];

    const flags: string[] = [];
    for (const text of textsToScan) {
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
          flags.push(`Matched adversarial pattern: ${pattern.toString()}`);
        }
      }
    }

    if (flags.length > 0) {
      return {
        passed: false,
        promptInjectionDetected: true,
        flags,
        message: `Security threat detected: Intent analysis flagged prompt injection or unauthorized override payload.`,
      };
    }

    return {
      passed: true,
      promptInjectionDetected: false,
      flags: [],
      message: "Security scanning passed. No adversarial payloads or injection anomalies detected.",
    };
  }

  static evaluate(request: ProcurementRequest, currentDailySpend: number = 0): PolicyDecision {
    const budgetCheck = this.checkBudget(request);
    const dailyCapCheck = this.checkDailyCap(request, currentDailySpend);
    const vendorCheck = this.checkVendor(request);
    const securityScan = this.scanSecurity(request);

    const guardrails: GuardrailEvaluation = {
      budgetCheck,
      dailyCapCheck,
      vendorCheck,
      securityScan,
    };

    const reasons: string[] = [];

    // 1. Critical Hard Failure: Security Threat
    if (!securityScan.passed) {
      reasons.push(securityScan.message, ...securityScan.flags);
      return {
        action: "REJECT",
        confidence: 0.99,
        reasons,
        guardrails,
        requiresHumanApproval: false,
        suggestedActionPlan: "Immediate reject and quarantine agent session due to injection signature.",
      };
    }

    // 2. Blocked Vendor
    if (!vendorCheck.passed || vendorCheck.trustLevel === "BLOCKED") {
      reasons.push(vendorCheck.message);
      return {
        action: "REJECT",
        confidence: 0.95,
        reasons,
        guardrails,
        requiresHumanApproval: false,
        suggestedActionPlan: "Reject transaction: Destination merchant is blocked by corporate security.",
      };
    }

    // 3. Price calculation tampering or basic invalid budget
    if (!budgetCheck.passed && (budgetCheck.requested <= 0 || budgetCheck.message.includes("Price calculation mismatch"))) {
      reasons.push(budgetCheck.message);
      return {
        action: "REJECT",
        confidence: 0.99,
        reasons,
        guardrails,
        requiresHumanApproval: false,
        suggestedActionPlan: "Reject invalid transaction amount or price calculation tampering.",
      };
    }

    // 4. Exceeds max budget limit or daily cap limit -> Escalate or Reject
    if (!budgetCheck.passed) {
      reasons.push(budgetCheck.message);
      return {
        action: "ESCALATE_TO_HUMAN",
        confidence: 0.9,
        reasons,
        guardrails,
        requiresHumanApproval: true,
        suggestedActionPlan: "Transaction exceeds automated single-purchase limit. Requires managerial sign-off.",
      };
    }

    if (!dailyCapCheck.passed) {
      reasons.push(dailyCapCheck.message);
      return {
        action: "ESCALATE_TO_HUMAN",
        confidence: 0.9,
        reasons,
        guardrails,
        requiresHumanApproval: true,
        suggestedActionPlan: "Daily budget threshold reached. Escalate to treasury controller.",
      };
    }

    // 5. Human-in-the-loop threshold
    const approvalThreshold = config.policy.requireApprovalThreshold;
    if (request.item.totalAmount > approvalThreshold) {
      reasons.push(
        `Transaction amount $${request.item.totalAmount} exceeds autonomous approval threshold ($${approvalThreshold}). Human confirmation requested.`
      );
      return {
        action: "ESCALATE_TO_HUMAN",
        confidence: 0.88,
        reasons,
        guardrails,
        requiresHumanApproval: true,
        suggestedActionPlan: "Queue for dual-custody approval before dispatching funds.",
      };
    }

    // 6. Neutral vendor check: if vendor is neutral and amount is moderate, approve with telemetry note
    if (vendorCheck.trustLevel === "NEUTRAL") {
      reasons.push(vendorCheck.message);
    } else {
      reasons.push("Vendor is on verified allowlist.");
    }

    reasons.push("All policy guardrails satisfied.");

    return {
      action: "APPROVE",
      confidence: 0.98,
      reasons,
      guardrails,
      requiresHumanApproval: false,
      suggestedActionPlan: "Proceed with automated PayPal payment execution.",
    };
  }
}
