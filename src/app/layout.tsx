import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAIRIA Conclusions — Générateur de conclusions prud'homales",
  description: "Outil spécialisé de génération de conclusions en défense employeur pour le Conseil de Prud'hommes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
        {children}
      </body>
    </html>
  );
}
