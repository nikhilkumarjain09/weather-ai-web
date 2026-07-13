import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SavedLocation, ThemePreference, TemperatureUnit, AppNotification } from "@/lib/types";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "danger";
}

interface AppState {
  // Authentication / Identity
  userName: string | null;
  setUserName: (name: string | null) => void;

  // Theme & Units
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  unit: TemperatureUnit;
  toggleUnit: () => void;

  // Locations
  savedLocations: SavedLocation[];
  addSavedLocation: (location: Omit<SavedLocation, "id">) => void;
  removeSavedLocation: (id: string) => void;
  activeLocation: SavedLocation | null; // null means "Current Location" (GeoIP)
  setActiveLocation: (location: SavedLocation | null) => void;

  // Comparison Grid Selection
  comparisonIds: string[];
  toggleComparisonLocation: (id: string) => void;

  // Notifications Queue
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem["type"]) => void;
  dismissToast: (id: string) => void;

  // Modals
  activeModal: "settings" | "shortcuts" | "saved_locations" | "alert_subscribe" | null;
  setActiveModal: (modal: "settings" | "shortcuts" | "saved_locations" | "alert_subscribe" | null) => void;

  // UI State
  activeView: string;
  setActiveView: (view: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  apiPlan: "free" | "pro";
  setApiPlan: (plan: "free" | "pro") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: null,
      setUserName: (name) => set({ userName: name }),

      theme: "system",
      setTheme: (theme) => set({ theme }),

      unit: "C",
      toggleUnit: () => set((state) => ({ unit: state.unit === "C" ? "F" : "C" })),

      savedLocations: [
        { id: "default-1", name: "San Francisco, CA", lat: 37.7749, lon: -122.4194, isDefault: true },
        { id: "default-2", name: "New York, NY", lat: 40.7128, lon: -74.0060, isDefault: false },
        { id: "default-3", name: "London, UK", lat: 51.5074, lon: -0.1278, isDefault: false },
      ],
      addSavedLocation: (loc) =>
        set((state) => {
          const id = `loc-${Date.now()}`;
          const newLoc = { ...loc, id };
          const updatedList = state.savedLocations.map((item) =>
            loc.isDefault ? { ...item, isDefault: false } : item
          );
          return { savedLocations: [...updatedList, newLoc] };
        }),
      removeSavedLocation: (id) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
          activeLocation: state.activeLocation?.id === id ? null : state.activeLocation,
        })),

      activeLocation: null,
      setActiveLocation: (activeLocation) => set({ activeLocation }),

      comparisonIds: ["default-1", "default-2"],
      toggleComparisonLocation: (id) =>
        set((state) => {
          const exists = state.comparisonIds.includes(id);
          const comparisonIds = exists
            ? state.comparisonIds.filter((cid) => cid !== id)
            : [...state.comparisonIds, id];
          return { comparisonIds };
        }),

      notifications: [
        {
          id: "welcome-1",
          title: "System Notification",
          message: "Welcome to Aeris. Track real-time weather with AI weather summaries.",
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
          // Auto dismiss after 4s
          setTimeout(() => {
            useAppStore.getState().dismissToast(id);
          }, 4000);
          return { toasts: [...state.toasts, { id, message, type }] };
        }),
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      activeModal: null,
      setActiveModal: (activeModal) => set({ activeModal }),

      activeView: "dashboard",
      setActiveView: (activeView) => set({ activeView }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      apiPlan: "free",
      setApiPlan: (apiPlan) => set({ apiPlan }),
    }),
    {
      name: "aeris-app-store",
      partialize: (state) => ({
        userName: state.userName,
        theme: state.theme,
        unit: state.unit,
        savedLocations: state.savedLocations,
        comparisonIds: state.comparisonIds,
        apiPlan: state.apiPlan,
        activeView: state.activeView,
      }),
    }
  )
);
