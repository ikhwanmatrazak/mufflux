import type { Metadata } from "next";
import { Providers } from "@/components/ui/Providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Mufflux — Malaysian Performance Exhaust Brand",
  description: "Premium motorcycle exhaust systems. PERFORMANCE. MEROKET. Est. 2024.",
  metadataBase: new URL("https://mufflux.com"),
  openGraph: {
    title: "Mufflux — Malaysian Performance Exhaust Brand",
    description: "Premium motorcycle exhaust systems. PERFORMANCE. MEROKET. Est. 2024.",
    url: "https://mufflux.com",
    siteName: "Mufflux",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mufflux — Malaysian Performance Exhaust Brand",
      },
    ],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mufflux — Malaysian Performance Exhaust Brand",
    description: "Premium motorcycle exhaust systems. PERFORMANCE. MEROKET. Est. 2024.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
