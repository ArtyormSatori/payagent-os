"use client";

import React, { useState } from "react";
import { TransactionRow } from "./ag-grid-dashboard";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ExternalLink,
  Code2,
  FileText,
  UserCheck,
} from "lucide-react";

interface AuditModalProps {
  transaction: TransactionRow | null;
  onClose: () => void;
  onApproveEscalated?: (requestId: string) => Promise<void>;
}

export default function AuditModal({
  transaction,
  onClose,
  onApproveEscalated,
}: AuditModalProps) {
  const [activeTab, setActiveTab] = useState<"trail" | "guardrails" | "raw">("trail");
  const [isApproving, setIsApproving] = useState(false);

  if (!transaction) return null;

  const isPending = transaction.status === "PENDING_APPROVAL";

  const handleApprove = async () => {
    if (!onApproveEscalated) return;
    setIsApproving(true);
    try {
      await onApproveEscalated(transaction.requestId);
      onClose();
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  {transaction.transactionId}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    transaction.status === "COMPLETED"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      : transaction.status === "PENDING_APPROVAL"
                      ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                      : "bg-rose-950 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Agent: <span className="text-slate-200 font-mono">{transaction.agentId}</span> • Role: {transaction.agentRole}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab("trail")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === "trail"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Execution Audit Trail ({transaction.auditTrail?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("guardrails")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === "guardrails"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Guardrail Evaluation</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === "raw"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw PayAgent Record</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Item & Vendor</div>
              <div className="font-semibold text-slate-200 mt-0.5 truncate">{transaction.itemName}</div>
              <div className="text-slate-400 text-[11px] truncate">{transaction.vendorName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Amount & Rail</div>
              <div className="font-bold text-emerald-400 mt-0.5 font-mono text-sm">
                ${Number(transaction.amount).toFixed(2)} {transaction.currency}
              </div>
              <div className="text-slate-400 text-[11px] font-mono">{transaction.paymentMethod}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">PayPal Reference</div>
              <div className="font-mono text-slate-300 mt-0.5 text-[11px] truncate">
                {transaction.paymentReferenceId || "N/A (Pending/Blocked)"}
              </div>
              <div className="text-slate-500 text-[10px]">Settlement ID</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Confidence & Action</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {transaction.decisionAction} ({(transaction.confidence * 100).toFixed(0)}%)
              </div>
              <div className="text-slate-500 text-[10px]">
                {transaction.requiresHumanApproval ? "Human Approval Required" : "Autonomous Pass"}
              </div>
            </div>
          </div>

          {/* Justification */}
          {transaction.justification && (
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">
                Agent Justification
              </div>
              <p className="text-slate-300 italic text-xs leading-relaxed">
                &ldquo;{transaction.justification}&rdquo;
              </p>
            </div>
          )}

          {/* Tab 1: Execution Audit Trail */}
          {activeTab === "trail" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Sequential Audit Trace
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {transaction.auditTrail && transaction.auditTrail.length > 0 ? (
                  transaction.auditTrail.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 bg-blue-500"></div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-blue-400 text-xs">
                            {step.step}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-slate-900 p-2 rounded mt-1.5 border border-slate-800/50">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">No audit trail events recorded.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Policy Guardrails */}
          {activeTab === "guardrails" && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">1. Single Transaction Budget Cap</span>
                  <span className="font-mono text-emerald-400">Limit: $500.00 USD</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">2. Daily Fleet Spend Cap</span>
                  <span className="font-mono text-emerald-400">Limit: $2,500.00 USD/day</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">3. Vendor Trust Rating</span>
                  <span className="font-mono text-blue-400">Domain Verification & Reputation Check</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">4. LLM Injection & Jailbreak Scanner</span>
                  <span className="font-mono text-purple-400">Semantic & Token-Level Sanitization</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Raw JSON */}
          {activeTab === "raw" && (
            <div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Transaction Ref: {transaction.requestId}
          </div>

          <div className="flex items-center gap-3">
            {isPending && onApproveEscalated && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isApproving ? "Processing Approval..." : "Approve Escalation (Human-in-the-Loop)"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
