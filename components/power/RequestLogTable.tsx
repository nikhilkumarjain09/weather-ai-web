"use client";

import React, { useState, useEffect } from "react";
import { getRequestLogs, clearRequestLogs } from "@/lib/requestLogStore";
import { RequestLog } from "@/lib/types";
import { ScrollText, Trash2, Download, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function RequestLogTable() {
  const { showToast } = useAppStore();
  const [logs, setLogs] = useState<RequestLog[]>([]);

  const loadLogs = () => {
    setLogs(getRequestLogs());
  };

  useEffect(() => {
    loadLogs();
    
    // Custom event to sync logs updates
    window.addEventListener("aeris-logs-updated", loadLogs);
    return () => window.removeEventListener("aeris-logs-updated", loadLogs);
  }, []);

  const handleClear = () => {
    clearRequestLogs();
    showToast("Cleared transaction logs", "info");
  };

  const handleExport = () => {
    if (logs.length === 0) return;
    
    const headers = ["ID", "Timestamp", "Endpoint", "Params", "Status", "Latency", "Cache"];
    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      log.endpoint,
      log.params.replace(/"/g, '""'),
      log.status,
      log.latency,
      log.cache,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aeris_request_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Exported logs to CSV", "success");
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
            <ScrollText className="text-accent" size={18} />
            Proxy Transaction Logs
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Audit trailing WeatherAI API queries executed via server routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface-raised rounded text-xs font-semibold text-text-muted hover:text-text-primary hover:border-accent/30 transition-all"
              >
                <Download size={13} />
                Export CSV
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface-raised rounded text-xs font-semibold text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
              >
                <Trash2 size={13} />
                Clear Logs
              </button>
            </>
          )}
          <button
            onClick={loadLogs}
            className="p-1.5 border border-border bg-surface-raised rounded text-text-muted hover:text-text-primary hover:border-accent/30 transition-all"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-surface border-border text-center">
          <ScrollText className="text-text-muted opacity-40 mb-3" size={32} />
          <h3 className="font-display text-sm font-bold text-text-primary mb-1">No Transactions Recorded</h3>
          <p className="text-xs text-text-muted max-w-xs">
            Trigger weather fetches or queries in the API Playground to populate logs.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-raised border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Parameters</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Cache</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-3 text-text-muted font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-3 font-mono font-bold text-text-primary">{log.endpoint}</td>
                  <td className="p-3 text-text-muted font-mono truncate max-w-[200px]" title={log.params}>
                    {log.params}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 font-semibold">
                      {log.status === 200 ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-500 font-mono">200 OK</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          <span className="text-red-500 font-mono">{log.status}</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-text-muted font-mono font-semibold">{log.latency}ms</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.cache === "hit"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-text-muted/10 text-text-muted border border-text-muted/20"
                      }`}
                    >
                      {log.cache}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
