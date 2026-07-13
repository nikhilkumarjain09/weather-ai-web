"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BellRing, X, Plus, AlertTriangle } from "lucide-react";
import LockedFeatureBadge from "@/components/shared/LockedFeatureBadge";

interface AlertSubscribeModalProps {
  onSubscriptionCreated?: () => void;
}

export default function AlertSubscribeModal({ onSubscriptionCreated }: AlertSubscribeModalProps) {
  const { activeModal, setActiveModal, showToast } = useAppStore();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["alert.storm"]);
  const [submitting, setSubmitting] = useState(false);
  const [lockedError, setLockedError] = useState<string | null>(null);

  const isOpen = activeModal === "alert_subscribe";

  if (!isOpen) return null;

  const handleToggleEvent = (ev: string) => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((item) => item !== ev) : [...prev, ev]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLockedError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, events }),
      });

      const json = await res.json();

      if (res.status === 403 || (json.error && json.error.code === 403)) {
        const errorMsg =
          json.error?.message ||
          json.message ||
          "Webhook alerts require a Pro tier API key";
        setLockedError(errorMsg);
        showToast("Webhook subscription failed: tier locked", "danger");
      } else if (!res.ok) {
        const errorMsg =
          json.error?.message || json.message || "Failed to create subscription";
        throw new Error(errorMsg);
      } else {
        showToast("Webhook subscription registered successfully", "success");
        if (onSubscriptionCreated) onSubscriptionCreated();
        setWebhookUrl("");
        setActiveModal(null);
      }
    } catch (err: any) {
      showToast(err.message || "Subscription failure", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-slide-in">
        <button
          onClick={() => {
            setLockedError(null);
            setActiveModal(null);
          }}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <BellRing className="text-accent" size={20} />
          <h2 className="font-display text-base font-bold text-text-primary">Configure Webhook Alert</h2>
        </div>

        {lockedError ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold flex items-center gap-1.5 mb-1 text-text-primary">
                  Pro Feature Flagged <LockedFeatureBadge />
                </p>
                <p className="opacity-90 leading-relaxed font-medium">
                  {lockedError}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLockedError(null)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setLockedError(null);
                  setActiveModal(null);
                }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary hover:bg-surface-raised/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Webhook Target URL
              </label>
              <input
                type="url"
                placeholder="https://api.domain.com/weather-alerts"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 placeholder-text-muted font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                Target Events
              </label>
              <div className="space-y-2 mt-2">
                {[
                  { id: "alert.storm", label: "Severe Storm Warning" },
                  { id: "alert.temp_extreme", label: "Extreme Temperatures" },
                  { id: "alert.wind", label: "Gale & High Winds" },
                ].map((ev) => (
                  <label
                    key={ev.id}
                    className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={events.includes(ev.id)}
                      onChange={() => handleToggleEvent(ev.id)}
                      className="rounded bg-surface-raised border-border text-accent focus:ring-accent"
                    />
                    <span>{ev.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-all mt-6 flex items-center justify-center gap-1.5"
            >
              <Plus size={12} />
              {submitting ? "Registering..." : "Register Webhook"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
