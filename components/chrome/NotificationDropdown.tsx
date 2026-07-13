"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Check, Trash2, BellRing, Info } from "lucide-react";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } = useAppStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Pull real events on mount
  useEffect(() => {
    async function checkRealEvents() {
      try {
        const usageRes = await fetch("/api/usage");
        if (usageRes.ok) {
          const usage = await usageRes.json();
          const ratio = usage.used / usage.limit;
          if (ratio >= 0.8) {
            const currentNotifs = useAppStore.getState().notifications;
            const hasQuotaNotif = currentNotifs.some((n) => n.title === "Quota Warning");
            if (!hasQuotaNotif) {
              useAppStore.getState().addNotification({
                title: "Quota Warning",
                message: `Consumed ${Math.round(ratio * 100)}% of limit quota (${usage.used}/${usage.limit} reqs).`,
                type: "alert",
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to query usage metrics:", e);
      }

      try {
        const alertsRes = await fetch("/api/alerts");
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          const currentNotifs = useAppStore.getState().notifications;
          const hasWebhookNotif = currentNotifs.some((n) => n.title === "Webhooks Active");
          if (!hasWebhookNotif && alertsData.subscriptions && alertsData.subscriptions.length > 0) {
            useAppStore.getState().addNotification({
              title: "Webhooks Active",
              message: `Telemetry webhooks active on endpoint: ${alertsData.subscriptions[0].url}`,
              type: "info",
            });
          }
        }
      } catch {
        // Suppress expected 403 on free tier
      }
    }

    checkRealEvents();
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 rounded-lg bg-surface border border-border shadow-xl py-2 z-50 animate-slide-in font-sans"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-2 bg-accent/20 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
              className="text-text-muted hover:text-text-primary p-1 hover:bg-surface-raised rounded transition-colors"
            >
              <Check size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              title="Clear all"
              className="text-text-muted hover:text-red-500 p-1 hover:bg-surface-raised rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted px-4">
            <Info size={24} className="mb-2 opacity-50" />
            <p className="text-xs">No notifications to display</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3 flex items-start gap-3 hover:bg-surface-raised cursor-pointer transition-colors ${
                  !n.read ? "bg-accent-tint/30" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === "alert" ? (
                    <BellRing size={16} className="text-warning animate-pulse" />
                  ) : (
                    <Info size={16} className="text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-text-muted block mt-1">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
