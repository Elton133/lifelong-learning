import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PWAInstaller from "@/components/pwa/PWAInstaller";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Lifelong Learning - Personal Growth Platform",
  description: "Hyper-personalized learning platform for continuous growth and skill development",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Learning",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            <PWAInstaller />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
