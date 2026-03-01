"use client";

import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  isAnonymous: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAnonymous: true,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      isAnonymous: session?.user?.is_anonymous ?? true,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
