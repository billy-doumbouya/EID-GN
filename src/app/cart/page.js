import { CartView } from "@/components/cart/CartView";
import { getCartQuote } from "@/lib/queries/cart";

export const metadata = {
  title: "Mon panier — EID-MULTISERVICE",
  description: "Votre panier EID-MULTISERVICE",
};

export default async function CartPage() {
  // Hydrate le panier côté serveur si user connecté
  // (pour les invités, le panier vient du localStorage)
  return <CartView />;
}
