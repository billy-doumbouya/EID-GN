"use client";

import { Suspense, useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { makeQueryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

NProgress.configure({ showSpinner: false });

function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

export function Providers({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

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
