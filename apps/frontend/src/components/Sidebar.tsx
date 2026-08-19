// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelectedUser } from "@/context/SelectedUserContext";
import { users } from "@/data/users";

const links = [
  { href: "/", label: "About" },
  { href: "/user", label: "User" },
  { href: "/billing", label: "Billing Application" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedUserId } = useSelectedUser();
  const activeUser = users.find((u) => u.id === selectedUserId) ?? null;

  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={pathname === l.href ? "font-semibold" : "text-gray-500"}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 border-t pt-3 text-xs">
        {activeUser ? (
          <span className="text-gray-700">
            <span className="font-bold">Selected User: </span>
            {activeUser.firstName} {activeUser.lastName}
          </span>
        ) : (
          <span className="text-gray-400">No user selected</span>
        )}
      </div>
    </aside>
  );
}