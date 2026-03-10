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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Progress",      value: `${pct}%`,  sub: `${done}/${total} done`, color: "text-emerald-400", border: "border-emerald-500/18" },
        { label: "High Priority", value: high,        sub: "to master",            color: "text-rose-400",    border: "border-rose-500/18"    },
        { label: "Medium",        value: medium,      sub: "in progress",          color: "text-amber-400",   border: "border-amber-500/18"   },
        { label: "Low",           value: low,         sub: "review later",         color: "text-cyan-400",    border: "border-cyan-500/18"    },
      ].map((s) => (
        <div key={s.label} className={`rounded-xl border ${s.border} bg-white/[0.02] px-4 py-3`}>
          <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-white/25 font-mono mt-0.5">{s.label}</div>
          <div className="text-xs text-white/15 font-mono">{s.sub}</div>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
