// src/app/user/page.tsx

"use client";
import { useSelectedUser } from "@/context/SelectedUserContext";
import { users, findUserById } from "@/data/users";
import { useViewState } from "@/context/ViewStateContext";
import { useSelector } from '@tanstack/react-store'


export default function UserPage() {
  const { selectedUserId, setSelectedUserId } = useSelectedUser();
  const selectedUser = findUserById(selectedUserId);
  
  const { columnVisibilityAtom, sortingAtom, columnFiltersAtom, clearViewState } = useViewState();
  const columnVisibility = useSelector(columnVisibilityAtom);
  const sorting = useSelector(sortingAtom);
  const columnFilters = useSelector(columnFiltersAtom);

  //Build Visibility Display Text
  const hiddenCols = Object.keys(columnVisibility).filter(
    (id) => columnVisibility[id] === false
  );

  const visibilityDisplay =
    hiddenCols.length === 0
      ? "All columns"
      : `All except: ${hiddenCols.join(", ")}`;

  return (
    <div className="max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">User</h1>
        <p className="mt-1 text-gray-500">
          Choose the active user. Each user has their own saved layout for the
          billing worklist.
        </p>
      </header>

      {/* Select user */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">Select user</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.map((user) => {
            const initials = user.firstName[0] + user.lastName[0];
            const selected = selectedUserId === user.id; //Boolean of whether the current user is selected
            return (
              <button
                key={user.id}
                type="button"
                onClick={()=> setSelectedUserId(user.id)}
                className={[
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition hover:cursor-pointer",
                  selected
                    ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {selected ? "Active" : "Tap to select"}
                  </span>
                </span>
                {selected && (
                  <span aria-hidden className="ml-auto text-gray-900">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Saved settings for the active user */}
      <section className="mt-10">
        <h2 className="text-lg font-medium">Saved settings</h2>
        {selectedUser ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              The layout {selectedUser.firstName} has saved for the billing worklist.
            </p>
            <dl className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-gray-500">Visible columns</dt>
                <dd className="text-sm text-gray-400">{visibilityDisplay}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-gray-500">Sort order</dt>
                <dd className="text-sm text-gray-400">{sorting.length === 0 ? "None" : sorting.map((s) => `${s.id} (${s.desc ? "desc" : "asc"})`).join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-gray-500">Active filters</dt>
                <dd className="text-sm text-gray-400">{columnFilters.length === 0 ? "None" : columnFilters.map((c) => `${c.id} = ${c.value}`).join(", ")}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-400">
            Select a user to see their saved layout.
          </p>
        )}
      </section>

      {/* Clear saved settings */}
      <section className="mt-10">
        <h2 className="text-lg font-medium">Reset</h2>
        {selectedUser ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Clear the saved layout for {selectedUser.firstName}{" "}
              {selectedUser.lastName}. Their view returns to the defaults next time
              the worklist loads.
            </p>
            <button
              type="button"
              onClick={() => clearViewState()}
              className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Clear saved settings
            </button>
            <button
              type="button"
              onClick={() => setSelectedUserId(null)}
              className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Clear saved user
            </button>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-400">
            Select a user to manage their saved settings.
          </p>
        )}
      </section>
    </div>
  );
}