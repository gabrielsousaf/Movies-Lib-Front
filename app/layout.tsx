import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movies Lib",
  description: "Sua biblioteca de filmes e séries favorita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Header />
          <CommandPalette />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-right" theme="dark" closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
