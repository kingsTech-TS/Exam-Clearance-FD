"use client";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar — Hidden on Tablet & Mobile (<= 1024px) */}
      <aside
        className="hide-tablet-mobile"
        style={{
          width: "224px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header breadcrumb={breadcrumb} />
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

