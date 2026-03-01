"use client";

import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { Toaster } from "sileo";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAnonymousAuth();

  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
