import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dare to Be — Event Evaluation | Colegio San Agustin - Bacolod",
  description: "Official mobile-first event evaluation form for Colegio San Agustin - Bacolod 'Dare to be' event.",
  icons: {
    icon: "/logos/csab.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
