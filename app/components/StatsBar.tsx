"use client";
import type { FullCard } from "../hooks/useFlashcardState";

interface Props { cards: FullCard[]; }

export default function StatsBar({ cards }: Props) {
  const total  = cards.length;
  const done   = cards.filter((c) => c.done).length;
  const high   = cards.filter((c) => c.priority === "high").length;
  const medium = cards.filter((c) => c.priority === "medium").length;
  const low    = cards.filter((c) => c.priority === "low").length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: "Progress", value: `${pct}%`, sub: `${done}/${total}`, accent: "rgb(52,211,153)",  borderColor: "rgba(16,185,129,0.18)" },
    { label: "High",     value: high,      sub: "to master",        accent: "rgb(251,113,133)", borderColor: "rgba(239,68,68,0.18)"  },
    { label: "Medium",   value: medium,    sub: "in progress",      accent: "rgb(251,191,36)",  borderColor: "rgba(245,158,11,0.18)" },
    { label: "Low",      value: low,       sub: "review later",     accent: "rgb(34,211,238)",  borderColor: "rgba(6,182,212,0.18)"  },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border px-3 py-2.5"
            style={{ borderColor: s.borderColor, background: "var(--bg-card)" }}>
            <div className="text-xl font-mono font-bold" style={{ color: s.accent }}>{s.value}</div>
            <div className="text-[10px] font-mono mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            <div className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(to right, rgb(16,185,129), rgb(6,182,212))" }} />
      </div>
    </div>
  );
}
