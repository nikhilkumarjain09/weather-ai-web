import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppNotification } from "@/lib/types";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "danger";
}

interface SettingsState {
  userName: string | null;
  setUserName: (name: string | null) => void;
  apiPlan: "free" | "pro";
  setApiPlan: (plan: "free" | "pro") => void;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem["type"]) => void;
  dismissToast: (id: string) => void;
  locationPermission: "prompt" | "granted" | "denied";
  setLocationPermission: (perm: "prompt" | "granted" | "denied") => void;
  privacyMode: boolean;
  setPrivacyMode: (mode: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: null,
      setUserName: (name) => set({ userName: name }),
      apiPlan: "free",
      setApiPlan: (plan) => set({ apiPlan: plan }),
      notifications: [
        {
          id: "welcome-1",
          title: "System Notification",
          message: "Welcome to Aeris. Track weather analytics with local historical caches and AI reports.",
          read: false,
          timestamp: new Date().toISOString(),
          type: "system",
        },
      ],
      addNotification: (notif) =>
        set((state) => {
          const newNotif: AppNotification = {
            ...notif,
            id: `notif-${Date.now()}`,
            read: false,
            timestamp: new Date().toISOString(),
          };
          return { notifications: [newNotif, ...state.notifications] };
        }),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      toasts: [],
      showToast: (message, type = "success") =>
        set((state) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          setTimeout(() => {
            get().dismissToast(id);
          }, 4000);
          return { toasts: [...state.toasts, { id, message, type }] };
        }),
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      locationPermission: "prompt",
      setLocationPermission: (locationPermission) => set({ locationPermission }),
      privacyMode: false,
      setPrivacyMode: (privacyMode) => set({ privacyMode }),
    }),
    {
      name: "aeris-settings-store",
    }
  )
);
