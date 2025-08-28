"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryClientProvider client={queryClient}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
