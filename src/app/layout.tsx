import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import AppShell from "@/components/AppShell";
import { EmailProvider } from "@/context/EmailContext";
export const metadata: Metadata = {
  title: "Murabbi Desk OS",
  description: "Premium Islamic Administrative Desktop Suite",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MurabbiDesk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="flup">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Inter at runtime — avoids build-time DNS fetch */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#f8fafc] font-sans transition-colors duration-500">
        <EmailProvider>
          <AppShell>{children}</AppShell>
        </EmailProvider>
      </body>
    </html>
  );
}
