import { StateCreator } from "zustand";
import { POSState } from "../posStore";

export interface UISlice {
  activePage: string;
  sidebarOpen: boolean;
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
}

export const createUISlice: StateCreator<POSState, [], [], UISlice> = (set) => ({
  activePage: "dashboard",
  sidebarOpen: true,
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
});
