"use client";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import "@/lib/i18n";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>Mufflux Exhaust System</title>
        <meta name="description" content="Premium motorcycle exhaust systems — Built for the Road. Made to Roar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <HeroUIProvider>
          <main className="dark text-foreground bg-background min-h-screen">
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: "#1a1a1a", color: "#fff", border: "1px solid #D400A8" },
                success: { iconTheme: { primary: "#D400A8", secondary: "#fff" } },
              }}
            />
          </main>
        </HeroUIProvider>
      </body>
    </html>
  );
}
