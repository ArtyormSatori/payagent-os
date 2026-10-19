import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayAgent OS (NexusPay AI) - Autonomous Agentic Commerce Gateway",
  description:
    "Autonomous Agentic Commerce Gateway & Financial Operations Center powered by PayPal Developer Platform, MCP, and AI Policy Guardrails",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
