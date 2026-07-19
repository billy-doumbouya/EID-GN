"use client";

import { Suspense, useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import NProgress from "nprogress";
import AOS from "aos";
import { usePathname, useSearchParams } from "next/navigation";
import { makeQueryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

NProgress.configure({ showSpinner: false });

function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
    // AOS ne detecte pas automatiquement les elements ajoutes lors d'une
    // navigation App Router (pas de reload complet) - on rafraichit son
    // cache de positions a chaque changement de route.
    AOS.refreshHard();
  }, [pathname, searchParams]);

  return null;
}

export function Providers({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    AOS.init({
      duration: 550,
      once: true,
      offset: 30,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-body)" },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
