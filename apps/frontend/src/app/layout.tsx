// app/layout.tsx
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SelectedUserProvider } from "@/context/SelectedUserContext";
import { ViewStateProvider } from "@/context/ViewStateContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <SelectedUserProvider>
          <ViewStateProvider>
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </ViewStateProvider>
        </SelectedUserProvider>
      </body>
    </html>
  );
}