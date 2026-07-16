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
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <ConditionalFooter />
          <ConditionalWidgets />
        </Providers>
      </body>
    </html>
  );
}
