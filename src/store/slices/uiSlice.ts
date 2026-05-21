import { StateCreator } from "zustand";
import { POSState } from "../posStore";

export interface UISlice {
  activePage: string;
  sidebarOpen: boolean;
  isLoading: boolean;
  dataError: string | null;
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setDataError: (error: string | null) => void;
}

export const createUISlice: StateCreator<POSState, [], [], UISlice> = (set) => ({
  activePage: "dashboard",
  sidebarOpen: true,
  isLoading: false,
  dataError: null,
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLoading: (loading) => set({ isLoading: loading }),
  setDataError: (error) => set({ dataError: error }),
});
