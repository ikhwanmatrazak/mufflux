import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  language: "en" | "bm";
  setLanguage: (lang: "en" | "bm") => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    { name: "mufflux-ui", partialize: (s) => ({ language: s.language }) }
  )
);
