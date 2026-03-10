import type { Metadata } from "next";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "DE Flashcards — Data Engineering Fundamentals",
  description: "Master Data Engineering concepts with interactive flashcards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
