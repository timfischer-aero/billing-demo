// src/context/SelectedUserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "demo:selectedUserId";

type SelectedUserContextValue = {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
};

// The context "channel." undefined default lets the hook detect
// when it's used outside the provider (see useSelectedUser below).
const SelectedUserContext = createContext<SelectedUserContextValue | undefined>(
  undefined
);

export function SelectedUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start null on BOTH server and first client render — no localStorage here,
  // or the two renders disagree and React throws a hydration warning.
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // After mount (client only), read the saved id and apply it.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedUserId(saved);
  }, []);

  // Whenever the selection changes, persist it. null clears the key.
  useEffect(() => {
    if (selectedUserId === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, selectedUserId);
    }
  }, [selectedUserId]);

  return (
    <SelectedUserContext.Provider value={{ selectedUserId, setSelectedUserId }}>
      {children}
    </SelectedUserContext.Provider>
  );
}

// Consumer hook — one clean call for any component that needs the selection.
export function useSelectedUser() {
  const ctx = useContext(SelectedUserContext);
  if (ctx === undefined) {
    throw new Error("useSelectedUser must be used within a SelectedUserProvider");
  }
  return ctx;
}