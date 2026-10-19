"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  GridApi,
} from "ag-grid-community";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

// Register all Community features for AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

export interface TransactionRow {
  transactionId: string;
  requestId: string;
  timestamp: string;
  agentId: string;
  agentRole: string;
  category: string;
  itemName: string;
  vendorName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReferenceId?: string;
  status: "COMPLETED" | "PENDING_APPROVAL" | "REJECTED" | "FAILED";
  decisionAction: string;
  requiresHumanApproval: boolean;
  confidence: number;
  justification: string;
  auditTrail: Array<{
    step: string;
    timestamp: string;
    details: Record<string, any>;
  }>;
}

interface AgGridDashboardProps {
  transactions: TransactionRow[];
  onSelectTransaction: (tx: TransactionRow) => void;
  onApproveEscalated?: (requestId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function AgGridDashboard({
  transactions,
  onSelectTransaction,
  onApproveEscalated,
  onRefresh,
  isLoading,
}: AgGridDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const gridRef = useRef<AgGridReact<TransactionRow>>(null);
  const [gridApi, setGridApi] = useState<GridApi<TransactionRow> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent<TransactionRow>) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  const handleQuickFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickFilterText(val);
    if (gridApi) {
      if (typeof (gridApi as any).setGridOption === "function") {
        (gridApi as any).setGridOption("quickFilterText", val);
      } else if (typeof (gridApi as any).setQuickFilter === "function") {
        (gridApi as any).setQuickFilter(val);
      }
    }
  };

  const handleExportCsv = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `payagent-telemetry-${new Date().toISOString().split("T")[0]}.csv`,
      });
    }
  };

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") return transactions;
    return transactions.filter((t) => t.status === statusFilter);
  }, [transactions, statusFilter]);

  const handleApprove = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation();
    if (!onApproveEscalated) return;
    setApprovingId(requestId);
    try {
      await onApproveEscalated(requestId);
    } finally {
      setApprovingId(null);
    }
  };

  // Custom Cell Renderers
  const StatusCellRenderer = (params: ICellRendererParams<TransactionRow>) => {
    const status = params.value;
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            COMPLETED
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            ESCALATED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  const PaymentMethodRenderer = (params: ICellRendererParams<TransactionRow>) => {
    const method = params.value;
    let badgeClass = "bg-blue-950/70 text-blue-300 border-blue-500/30";
    let label = "PayPal Order";
    if (method === "PAYPAL_INVOICE") {
      badgeClass = "bg-indigo-950/70 text-indigo-300 border-indigo-500/30";
      label = "PayPal Invoice";
    } else if (method === "PAYPAL_PAYOUT") {
      badgeClass = "bg-purple-950/70 text-purple-300 border-purple-500/30";
      label = "PayPal Payout";
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const CategoryRenderer = (params: ICellRendererParams<TransactionRow>) => {
    return (
      <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
        {params.value}
      </span>
    );
  };

  const AmountRenderer = (params: ICellRendererParams<TransactionRow>) => {
    const val = Number(params.value || 0).toFixed(2);
    return (
      <span className="font-mono font-bold text-slate-100 text-sm">
        ${val} <span className="text-xs text-slate-400 font-normal">{params.data?.currency || "USD"}</span>
      </span>
    );
  };

  const ActionCellRenderer = (params: ICellRendererParams<TransactionRow>) => {
    const row = params.data;
    if (!row) return null;
    const isPending = row.status === "PENDING_APPROVAL";

    return (
      <div className="flex items-center gap-2 h-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectTransaction(row);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition"
          title="View Cryptographic Audit Trail"
        >
          <Eye className="w-3 h-3" />
          <span>Trail</span>
        </button>

        {isPending && onApproveEscalated && (
          <button
            onClick={(e) => handleApprove(e, row.requestId)}
            disabled={approvingId === row.requestId}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition disabled:opacity-50"
            title="Approve Escalation (Human-in-the-Loop Sign-off)"
          >
            {approvingId === row.requestId ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            <span>Sign-off</span>
          </button>
        )}
      </div>
    );
  };

  const columnDefs: ColDef<TransactionRow>[] = useMemo(
    () => [
      {
        headerName: "TX ID",
        field: "transactionId",
        width: 155,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<TransactionRow>) => (
          <span className="font-mono text-xs font-medium text-blue-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-400 shrink-0" />
            {p.value}
          </span>
        ),
      },
      {
        headerName: "Agent Fleet Identity",
        field: "agentId",
        width: 180,
        cellRenderer: (p: ICellRendererParams<TransactionRow>) => (
          <div>
            <div className="text-xs font-semibold text-slate-200">{p.value}</div>
            <div className="text-[10px] text-slate-400 truncate">{p.data?.agentRole}</div>
          </div>
        ),
      },
      {
        headerName: "Category",
        field: "category",
        width: 130,
        cellRenderer: CategoryRenderer,
      },
      {
        headerName: "Item / Service",
        field: "itemName",
        width: 220,
        cellRenderer: (p: ICellRendererParams<TransactionRow>) => (
          <div className="truncate" title={p.value}>
            <span className="text-xs text-slate-200 font-medium">{p.value}</span>
            <div className="text-[10px] text-slate-500 truncate">Vendor: {p.data?.vendorName}</div>
          </div>
        ),
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 120,
        cellRenderer: AmountRenderer,
        comparator: (a, b) => a - b,
      },
      {
        headerName: "Settlement Rail",
        field: "paymentMethod",
        width: 140,
        cellRenderer: PaymentMethodRenderer,
      },
      {
        headerName: "Governance Status",
        field: "status",
        width: 145,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "PayPal Reference",
        field: "paymentReferenceId",
        width: 150,
        cellRenderer: (p: ICellRendererParams<TransactionRow>) => (
          <span className="font-mono text-[11px] text-slate-400">
            {p.value || <span className="text-slate-600">N/A</span>}
          </span>
        ),
      },
      {
        headerName: "Actions",
        width: 160,
        cellRenderer: ActionCellRenderer,
        sortable: false,
        filter: false,
        pinned: "right",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelectTransaction, onApproveEscalated, approvingId]
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const stats = useMemo(() => {
    const total = transactions.length;
    const completed = transactions.filter((t) => t.status === "COMPLETED");
    const escalated = transactions.filter((t) => t.status === "PENDING_APPROVAL");
    const blocked = transactions.filter((t) => t.status === "REJECTED");
    const totalValue = completed.reduce((sum, t) => sum + t.amount, 0);

    return { total, completed: completed.length, escalated: escalated.length, blocked: blocked.length, totalValue };
  }, [transactions]);

  if (!mounted) {
    return (
      <div className="h-96 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Mounting AG Grid Enterprise Telemetry Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Control Bar & Filter Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AG Grid Enterprise Telemetry & Audit Ledger
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                AG Grid v36
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time multi-agent financial transaction log with instant guardrail auditing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickFilterText}
              onChange={handleQuickFilterChange}
              placeholder="Search agents, vendors, tx..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52 sm:w-64"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            {["ALL", "COMPLETED", "PENDING_APPROVAL", "REJECTED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s === "PENDING_APPROVAL" ? "ESCALATED" : s}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            title="Export filtered dataset to CSV via AG Grid CSV Export Module"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* AG Grid React Container */}
      <div className="ag-theme-quartz-dark w-full" style={{ height: 420 }}>
        <AgGridReact<TransactionRow>
          ref={gridRef}
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={(e) => e.data && onSelectTransaction(e.data)}
          rowSelection="single"
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
        />
      </div>

      {/* Grid Footer Telemetry Summary */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Total Transactions: <strong className="text-white font-mono">{stats.total}</strong>
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Settled: <strong className="font-mono text-emerald-300">{stats.completed}</strong>
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Escalated: <strong className="font-mono text-amber-300">{stats.escalated}</strong>
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Blocked: <strong className="font-mono text-rose-300">{stats.blocked}</strong>
          </span>
        </div>
        <div className="font-mono">
          Settled Volume: <strong className="text-emerald-400 font-bold">${stats.totalValue.toFixed(2)} USD</strong>
        </div>
      </div>
    </div>
  );
}
