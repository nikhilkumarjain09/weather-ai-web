"use client";

import React, { useState } from "react";
import { Terminal, Send, RefreshCw, AlertTriangle, CornerDownRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { addRequestLog } from "@/lib/requestLogStore";

export default function ApiPlayground() {
  const { showToast } = useAppStore();
  const [endpoint, setEndpoint] = useState<"/api/weather" | "/api/usage" | "/api/alerts" | "/api/logs">("/api/weather");
  
  // Inputs
  const [lat, setLat] = useState("37.7749");
  const [lon, setLon] = useState("-122.4194");
  const [ai, setAi] = useState(false);
  const [name, setName] = useState("Playground Node");

  // Output
  const [response, setResponse] = useState<any | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setLatency(null);

    const startTime = Date.now();
    let queryStr = "";
    
    if (endpoint === "/api/weather") {
      queryStr = `?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&ai=${ai}`;
    }

    try {
      const url = `${endpoint}${queryStr}`;
      const res = await fetch(url);
      const data = await res.json();
      
      const resLatency = Date.now() - startTime;
      setStatus(res.status);
      setLatency(resLatency);
      setResponse(data);

      // Append transaction to Request Log store
      addRequestLog({
        endpoint,
        params: queryStr || "none",
        status: res.status,
        latency: resLatency,
        cache: data._meta?.cache || "miss",
      });

      if (res.status === 200) {
        showToast(`Request complete: 200 OK`, "success");
      } else {
        showToast(`Request failed: status ${res.status}`, "danger");
      }
    } catch (err: any) {
      const resLatency = Date.now() - startTime;
      setStatus(500);
      setLatency(resLatency);
      setResponse({ error: err.message || "Failed to make transaction" });
      
      addRequestLog({
        endpoint,
        params: queryStr || "none",
        status: 500,
        latency: resLatency,
        cache: "miss",
      });

      showToast("Playground transaction error", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2 mb-1">
        <Terminal className="text-accent" size={18} />
        Developer API Playground
      </h3>
      <p className="text-xs text-text-muted mb-6">
        Execute HTTP REST calls against WeatherAI proxies. All queries log transaction traces.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <form onSubmit={handleSend} className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              API Endpoint
            </label>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value as any)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent/40"
            >
              <option value="/api/weather">GET /v1/weather</option>
              <option value="/api/usage">GET /v1/usage</option>
              <option value="/api/alerts">GET /v1/alerts</option>
              <option value="/api/logs">GET /v1/logs</option>
            </select>
          </div>

          {endpoint === "/api/weather" && (
            <div className="space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent/40"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">
                  Location Label
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ai-toggle"
                  checked={ai}
                  onChange={(e) => setAi(e.target.checked)}
                  className="rounded bg-surface-raised border-border text-accent focus:ring-accent"
                />
                <label htmlFor="ai-toggle" className="text-xs font-semibold text-text-muted select-none">
                  Request AI Synthesis (`ai=true`)
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            Execute Request
          </button>
        </form>

        {/* Output Panel */}
        <div className="lg:col-span-3 flex flex-col border border-border rounded-lg bg-surface-raised overflow-hidden min-h-[250px]">
          {/* Header */}
          <div className="bg-surface px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <CornerDownRight size={10} /> Response Payload
            </span>
            {status !== null && (
              <div className="flex items-center gap-3 font-mono text-[10px] font-semibold">
                <span className={status === 200 ? "text-emerald-500" : "text-red-500"}>
                  STATUS: {status}
                </span>
                <span className="text-text-muted">TIME: {latency}ms</span>
              </div>
            )}
          </div>

          {/* JSON code container */}
          <div className="flex-1 p-3 overflow-auto font-mono text-[10px] text-text-primary leading-normal max-h-[300px]">
            {response ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-text-muted opacity-60">
                <Terminal size={24} className="mb-2" />
                <span>Await payload injection...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
