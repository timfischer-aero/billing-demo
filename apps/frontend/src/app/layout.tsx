// app/layout.tsx
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SelectedUserProvider } from "@/context/SelectedUserContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <SelectedUserProvider>
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
        </SelectedUserProvider>
      </body>
    </html>
  );
}