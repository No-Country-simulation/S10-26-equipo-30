import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderFallback } from "@/components/site-header-fallback";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "NoCountry · Cargar Proyecto";
const description =
  "Prototipo funcional del flujo de carga de proyectos para decisores en NoCountry.";

export const metadata: Metadata = {
  title,
  description,
  // La imagen de la vista previa sale de src/app/opengraph-image.png.
  openGraph: {
    title,
    description,
    siteName: "NoCountry",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        {children}
        <WhatsAppFab />
      </body>
    </html>
  );
}
