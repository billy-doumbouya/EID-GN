import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { ConditionalWidgets } from "@/components/ConditionalWidgets";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL("https://eid-gn.com"),
  title: {
    default: "EID-MULTISERVICE — Motos, tricycles & pièces détachées en Haute-Guinée",
    template: "%s | EID-MULTISERVICE",
  },
  description:
    "Le spécialiste de la mobilité en Haute-Guinée. Vente de motos, tricycles, pièces détachées certifiées avec compatibilité vérifiée. Paiement Orange Money & MTN Mobile Money. Livraison rapide Kankan et région.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-screen flex-col font-sans bg-offwhite-100 text-navy-900 antialiased">
        <Providers>
          <Navbar />
            <main className="flex-1">{children}</main>
          <ConditionalFooter />
          <ConditionalWidgets />
        </Providers>
      </body>
    </html>
  );
}
