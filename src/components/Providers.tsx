"use client";

import { SessionProvider } from "next-auth/react";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Spinner } from "@/components/Spinner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
        <Spinner />
      </LoadingProvider>
    </SessionProvider>
  );
}

