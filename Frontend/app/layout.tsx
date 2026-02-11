import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "UniEvent Web-Hub | Discover College Events",
  description:
    "Your one-stop dashboard to discover hackathons, workshops, fests, and more from top colleges across the country.",
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
