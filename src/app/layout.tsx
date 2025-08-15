import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Remove Geist_Mono
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Remove a declaração da geistMono

export const metadata: Metadata = {
  title: "CS2 Pixels", // Um pouco mais de marketing no título
  description: "O seu consultor de pixels inteligente para CS2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Aplica apenas a variável da fonte principal */}
      <body className={geistSans.variable}>
        {children}
      </body>
    </html>
  );
}