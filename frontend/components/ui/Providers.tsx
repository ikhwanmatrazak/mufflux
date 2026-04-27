"use client";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <HeroUIProvider>
        <main className="text-foreground bg-background min-h-screen">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "var(--heroui-content2)", color: "var(--heroui-foreground)", border: "1px solid #D400A8" },
              success: { iconTheme: { primary: "#D400A8", secondary: "#fff" } },
            }}
          />
        </main>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
