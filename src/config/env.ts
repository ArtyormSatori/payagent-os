import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export interface AppConfig {
  paypal: {
    mode: "sandbox" | "mock";
    configuredMode: string;
    apiBaseUrl: string;
    clientId: string;
    clientSecret: string;
    isRealSandbox: boolean;
    mockLatencyMs: number;
    credentialsWaitingPoint: string;
  };
  policy: {
    maxTransactionLimit: number;
    dailySpendLimit: number;
    requireApprovalThreshold: number;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
}

function parseBool(val?: string, defaultVal: boolean = false): boolean {
  if (!val) return defaultVal;
  return val.toLowerCase() === "true" || val === "1";
}

function hasValidCredentials(clientId?: string, clientSecret?: string): boolean {
  if (!clientId || !clientSecret) return false;
  const cleanId = clientId.trim();
  const cleanSecret = clientSecret.trim();
  if (cleanId.length === 0 || cleanSecret.length === 0) return false;
  if (cleanId.includes("PLACEHOLDER") || cleanId.includes("YOUR_")) return false;
  if (cleanSecret.includes("PLACEHOLDER") || cleanSecret.includes("YOUR_")) return false;
  return true;
}

export function loadConfig(): AppConfig {
  const configuredMode = (process.env.PAYPAL_MODE || "auto").toLowerCase();
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
  const apiBaseUrl = process.env.PAYPAL_API_BASE_URL || "https://api-m.sandbox.paypal.com";

  const isRealCredentialsPresent = hasValidCredentials(clientId, clientSecret);

  let activeMode: "sandbox" | "mock" = "mock";
  if (configuredMode === "sandbox") {
    activeMode = isRealCredentialsPresent ? "sandbox" : "mock";
  } else if (configuredMode === "mock") {
    activeMode = "mock";
  } else {
    // "auto" mode
    activeMode = isRealCredentialsPresent ? "sandbox" : "mock";
  }

  const credentialsWaitingPoint = isRealCredentialsPresent
    ? "READY: User credentials detected for PayPal Sandbox"
    : "STANDBY: Awaiting user credentials in .env (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET). Mock Sandbox Driver ACTIVE.";

  return {
    paypal: {
      mode: activeMode,
      configuredMode,
      apiBaseUrl,
      clientId,
      clientSecret,
      isRealSandbox: isRealCredentialsPresent,
      mockLatencyMs: Number(process.env.PAYPAL_MOCK_LATENCY_MS) || 50,
      credentialsWaitingPoint,
    },
    policy: {
      maxTransactionLimit: Number(process.env.AGENT_MAX_TRANSACTION_LIMIT) || 500.0,
      dailySpendLimit: Number(process.env.AGENT_DAILY_SPEND_LIMIT) || 2500.0,
      requireApprovalThreshold: Number(process.env.AGENT_REQUIRE_APPROVAL_THRESHOLD) || 250.0,
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      nodeEnv: process.env.NODE_ENV || "development",
    },
  };
}

export const config = loadConfig();
