"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { useCreateAtom, useSelector } from '@tanstack/react-store'
import type { Atom } from "@tanstack/react-store";
import type {
  ColumnVisibilityState,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

type ViewStateContextValue = {
  columnVisibilityAtom: Atom<ColumnVisibilityState>;
  sortingAtom: Atom<SortingState>;
  columnFiltersAtom: Atom<ColumnFiltersState>;
  clearViewState: () => void; 
};

const ViewStateContext = createContext<ViewStateContextValue | undefined>( 
  undefined
);

//Default settings
const DEFAULT_VISIBILITY: ColumnVisibilityState = {}; //All default columns visible
const DEFAULT_SORTING: SortingState = [{ id: "patientNumber", desc: true }];
const DEFAULT_FILTERS: ColumnFiltersState = [];  //Empty filters

export function ViewStateProvider({ children}: { children: React.ReactNode}) {
    const columnVisibilityAtom = useCreateAtom<ColumnVisibilityState>(DEFAULT_VISIBILITY); 
    const sortingAtom = useCreateAtom<SortingState>(DEFAULT_SORTING);
    const columnFiltersAtom = useCreateAtom<ColumnFiltersState>(DEFAULT_FILTERS);

    const clearViewState = () => {
        // Step 7 fills this in
    };

    return (
        <ViewStateContext.Provider
      value={{
        columnVisibilityAtom,
        sortingAtom,
        columnFiltersAtom,
        clearViewState,
      }}
    >
      {children}
    </ViewStateContext.Provider>
    );
}

export function useViewState() {
  const ctx = useContext(ViewStateContext);
  if (ctx === undefined) {
    throw new Error("useViewState must be used within a ViewStateProvider");
  }
  return ctx;
}