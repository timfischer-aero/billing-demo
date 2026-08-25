"use client";

import { createContext, useContext, useState } from "react";

type DefinitionModalContextValue = {
  openCode: string | null;
  openDefinition: (code: string) => void;
  closeDefinition: () => void;
};

const DefinitionModalContext = createContext< DefinitionModalContextValue | undefined>(undefined);

export function DefinitionModalProvider({ children,}: { children: React.ReactNode;}) {
  const [openCode, setOpenCode] = useState<string | null>(null);

  const openDefinition = (code: string) => {
    setOpenCode(code);
  };

  const closeDefinition = () => {
    setOpenCode(null);
  };

  return (
    <DefinitionModalContext.Provider
      value={{ openCode, openDefinition, closeDefinition }}
    >
      {children}
    </DefinitionModalContext.Provider>
  );
}

export function useDefinitionModal() {
  const context = useContext(DefinitionModalContext);

  if (context === undefined) {
    throw new Error(
      "useDefinitionModal must be used within a DefinitionModalProvider",
    );
  }

  return context;
}