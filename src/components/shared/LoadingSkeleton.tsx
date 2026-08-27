"use client";

export function LoadingSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{ height: "1rem", flex: j === 0 ? 2 : 1, borderRadius: "4px" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card card-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="skeleton" style={{ height: "1rem", width: "60%" }} />
      <div className="skeleton" style={{ height: "2rem", width: "40%" }} />
      <div className="skeleton" style={{ height: "0.75rem", width: "80%" }} />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="skeleton" style={{ height: "1.5rem", width: "12rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
      </div>
      <div className="card">
        <LoadingSkeleton />
      </div>
    </div>
  );
}
