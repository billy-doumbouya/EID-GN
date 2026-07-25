import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { ConditionalWidgets } from "@/components/ConditionalWidgets";

export const metadata = {
  title: {
    default: "EID-GN Kankan - Motos, tricycles et pieces detachees",
    template: "%s | EID-GN Kankan",
  },
  description:
    "Achetez motos, tricycles et pieces detachees a Kankan. Paiement Orange Money et MTN Mobile Money. Livraison rapide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      {/* 
        1. flex flex-col min-h-screen : Permet au body de prendre au minimum 100% de la hauteur de l'écran.
      */}
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <Navbar />

          {/* 
            2. flex-1 : Indique au main de s'étirer pour remplir tout l'espace disponible 
               entre la Navbar et le Footer.
          */}
          <main className="flex-1">{children}</main>

          <ConditionalFooter />
          <ConditionalWidgets />
        </Providers>
      </body>
    </html>
  );
}
