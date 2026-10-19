export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-8 font-sans">
      <header className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wider">
              Flagship MVP
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center">
              ● Core Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            PayAgent OS <span className="text-blue-500">(NexusPay AI)</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous Agentic Commerce Gateway & Financial Operations Center for PayPal Developer Platform
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-slate-400">Sandbox Mode</div>
          <div className="text-sm font-semibold text-emerald-400">Auto Dual-Driver</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">PayPal REST v2</div>
          <div className="text-xl font-bold text-white mt-2">Orders, Invoices, Payouts</div>
          <p className="text-xs text-slate-400 mt-2">
            Dual-mode sandbox client with full schema parity and automatic placeholder fallback.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">AI Guardrails</div>
          <div className="text-xl font-bold text-white mt-2">Zero-Trust Procurement</div>
          <p className="text-xs text-slate-400 mt-2">
            Multi-layer defense: budget limits, daily caps, vendor allowlists & prompt injection scanning.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Agent Protocol</div>
          <div className="text-xl font-bold text-white mt-2">MCP & AI-Toolkit</div>
          <p className="text-xs text-slate-400 mt-2">
            Standard Model Context Protocol tool execution for autonomous multi-agent swarms.
          </p>
        </div>
      </div>

      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Core Verification Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
            <span className="text-blue-400">GET /api/health</span>
            <span className="text-slate-400">Engine Health & Driver Status</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
            <span className="text-blue-400">GET /api/agent/telemetry</span>
            <span className="text-slate-400">Financial Telemetry & Balance</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
            <span className="text-emerald-400">POST /api/agent/procure</span>
            <span className="text-slate-400">Autonomous Intent & Settlement</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
            <span className="text-emerald-400">POST /api/paypal/orders</span>
            <span className="text-slate-400">Create & Capture Orders</span>
          </div>
        </div>
      </section>
    </main>
  );
}
