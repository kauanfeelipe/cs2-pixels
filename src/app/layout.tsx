// src/app/layout.tsx
import type { Metadata } from "next";
// Troque a importação da fonte
import { Inter } from "next/font/google";
import "./globals.css";

// Configure a nova fonte
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter', // Opcional: usar como variável CSS
});

export const metadata: Metadata = {
  title: "CS2 Pixels",
  description: "O seu consultor de pixels inteligente para CS2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Aplique a classe da nova fonte
    <html lang="pt-BR" className={inter.className}>
      <body>
        {children}
      </body>
    </html>
  );
}