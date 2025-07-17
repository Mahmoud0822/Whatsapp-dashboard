import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhatsApp Business Dashboard",
  description: "Gerencie suas conversas e automatize seu atendimento no WhatsApp Business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
