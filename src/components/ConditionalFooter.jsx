"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

const HIDDEN_ON = ["/admin", "/compte"];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return <Footer />;
}