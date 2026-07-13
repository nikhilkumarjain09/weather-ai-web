import { create } from "zustand";

interface UiState {
  activeView: string;
  setActiveView: (view: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeModal: "settings" | "shortcuts" | "saved_locations" | "alert_subscribe" | null;
  setActiveModal: (modal: "settings" | "shortcuts" | "saved_locations" | "alert_subscribe" | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeView: "dashboard",
  setActiveView: (view) => set({ activeView: view }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
