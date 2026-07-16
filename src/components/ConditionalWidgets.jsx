"use client";

import { usePathname } from "next/navigation";
import { Chatbot } from "@/components/Chatbot";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

export function ConditionalWidgets() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <WhatsAppWidget />
      <Chatbot />
    </>
  );
}
