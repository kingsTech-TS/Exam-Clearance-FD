"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        id="mobile-menu-toggle"
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          cursor: "pointer",
          padding: "0.4rem",
          borderRadius: "6px",
          color: "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(2px)",
              animation: "fadeIn 0.2s ease-out",
            }}
          />
          {/* Drawer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "260px",
              maxWidth: "85vw",
              background: "var(--sidebar-bg)",
              boxShadow: "var(--shadow-lg)",
              animation: "slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Sidebar onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

