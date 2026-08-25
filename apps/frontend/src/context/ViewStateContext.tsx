"use client"

import { createContext, useContext, useEffect } from "react";
import { useCreateAtom, useSelector } from '@tanstack/react-store'
import { useSelectedUser } from "@/context/SelectedUserContext";

//Types
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
    const { selectedUserId } = useSelectedUser();

    const columnVisibilityAtom = useCreateAtom<ColumnVisibilityState>(DEFAULT_VISIBILITY); 
    const sortingAtom = useCreateAtom<SortingState>(DEFAULT_SORTING);
    const columnFiltersAtom = useCreateAtom<ColumnFiltersState>(DEFAULT_FILTERS);

    const columnVisibility = useSelector(columnVisibilityAtom);
    const sorting = useSelector(sortingAtom);
    const columnFilters = useSelector(columnFiltersAtom);

    useEffect(() => {
        if (selectedUserId === null) {
            // No user → defaults
            columnVisibilityAtom.set(DEFAULT_VISIBILITY);
            sortingAtom.set(DEFAULT_SORTING);
            columnFiltersAtom.set(DEFAULT_FILTERS);
            return;
        }

        const saved = localStorage.getItem(`demo:viewState:${selectedUserId}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            columnVisibilityAtom.set(parsed.columnVisibility ?? DEFAULT_VISIBILITY);
            sortingAtom.set(parsed.sorting ?? DEFAULT_SORTING);
            columnFiltersAtom.set(parsed.columnFilters ?? DEFAULT_FILTERS);
        } else {
            // User exists but has no saved view → defaults
            columnVisibilityAtom.set(DEFAULT_VISIBILITY);
            sortingAtom.set(DEFAULT_SORTING);
            columnFiltersAtom.set(DEFAULT_FILTERS);
        }
    }, [selectedUserId]);

    useEffect(() => {
        if (selectedUserId === null) return; // nobody to save for

            const payload = JSON.stringify({ columnVisibility, sorting, columnFilters });
            localStorage.setItem(`demo:viewState:${selectedUserId}`, payload);
    }, [selectedUserId, columnVisibility, sorting, columnFilters]);

    const clearViewState = () => {
        columnVisibilityAtom.set(DEFAULT_VISIBILITY);
        sortingAtom.set(DEFAULT_SORTING);
        columnFiltersAtom.set(DEFAULT_FILTERS);
        
        if (selectedUserId !== null) {
            localStorage.removeItem(`demo:viewState:${selectedUserId}`);
        }
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

