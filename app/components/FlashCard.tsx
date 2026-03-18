"use client";
import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { FullCard, Priority } from "../hooks/useFlashcardState";

interface Props {
  card: FullCard;
  onPriority: (p: Priority) => void;
  onDone: (done: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

const PRIORITIES: { label: string; value: Priority }[] = [
  { label: "Low",  value: "low"    },
  { label: "Mid",  value: "medium" },
  { label: "High", value: "high"   },
];

const priorityStyle = (value: Priority, active: boolean) => {
  const base = "text-xs px-3 py-1.5 rounded-xl border font-mono transition-all duration-200 select-none touch-manipulation";
  if (!active) {
    const idle: Record<string, string> = {
      low:    "text-cyan-500/60 border-cyan-500/20 bg-cyan-500/5",
      medium: "text-amber-500/60 border-amber-500/20 bg-amber-500/5",
      high:   "text-rose-500/60 border-rose-500/20 bg-rose-500/5",
    };
    return `${base} ${idle[value!]}`;
  }
  const on: Record<string, string> = {
    low:    "text-cyan-300 border-cyan-500/50 bg-cyan-500/20 shadow-sm shadow-cyan-500/20",
    medium: "text-amber-300 border-amber-500/50 bg-amber-500/20 shadow-sm shadow-amber-500/20",
    high:   "text-rose-300 border-rose-500/50 bg-rose-500/20 shadow-sm shadow-rose-500/20",
  };
  return `${base} ${on[value!]} scale-105`;
};

const PRIORITY_PILL: Record<string, string> = {
  low:    "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  high:   "bg-rose-500/15 text-rose-400 border border-rose-500/25",
};

export default function FlashCard({ card, onPriority, onDone, onEdit, onDelete, index }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cardHeight, setCardHeight] = useState<number>(88);
  const frontContentRef = useRef<HTMLDivElement>(null);
  const backContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frontH = frontContentRef.current?.offsetHeight ?? 88;
    const backH = backContentRef.current?.offsetHeight ?? 88;
    setCardHeight(flipped ? backH : frontH);
  }, [flipped, card.question, card.answer]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3, ease: "easeOut" }}
      layout
    >
      <div
        className="rounded-2xl border transition-all duration-300"
        style={{
          background: card.done ? "var(--bg-done)" : "var(--bg-card)",
          borderColor: card.done ? "var(--border-done)" : "var(--border)",
        }}
      >
        {/* ── Top row ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{card.emoji}</span>
            <span className="text-[10px] font-mono tracking-widest uppercase truncate"
              style={{ color: "var(--text-muted)" }}>
              {card.topic}
            </span>
            {!card.isDefault && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "var(--badge-custom-bg)", color: "var(--badge-custom-text)", border: "1px solid var(--badge-custom-border)" }}>
                custom
              </span>
            )}
          </div>

          {/* Pills + actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {card.priority && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${PRIORITY_PILL[card.priority]}`}>
                {card.priority}
              </span>
            )}
            {card.done && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                ✓
              </span>
            )}
            <button onClick={onEdit}
              className="p-1.5 rounded-lg transition-all touch-manipulation"
              style={{ color: "var(--text-muted)", background: "var(--input-bg)" }}>
              <Pencil size={11} />
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-all touch-manipulation"
                style={{ color: "var(--text-muted)", background: "var(--input-bg)" }}>
                <Trash2 size={11} />
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10">
                <span className="text-[10px] font-mono text-rose-400">Del?</span>
                <button onClick={onDelete} className="text-[10px] font-mono text-rose-300 font-bold">Y</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[10px] font-mono"
                  style={{ color: "var(--text-muted)" }}>N</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Flip card area ───────────────────────────────────── */}
        <div
          className="px-4 py-3 cursor-pointer select-none touch-manipulation"
          onClick={() => setFlipped(!flipped)}
          style={{
            perspective: "1200px",
            height: cardHeight + 24, // +24 for py-3 padding
            transition: "height 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)",
          }}
        >
          <div
            className={`card-flip-inner ${flipped ? "flipped" : ""}`}
            style={{ height: cardHeight }}
          >
            {/* Front: question */}
            <div className="card-face absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden">
              <div ref={frontContentRef} className="flex flex-col gap-2">
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}>
                  {card.question}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-mono"
                  style={{ color: "var(--text-faint)" }}>
                  <ChevronDown size={10} className="animate-bounce" />
                  tap to flip
                </div>
              </div>
            </div>

            {/* Back: answer */}
            <div className="card-face card-face-back absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden">
              <div ref={backContentRef} className="flex flex-col gap-2">
                <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(16,185,129,0.35), transparent)" }} />
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-serif)", color: "var(--answer-text)" }}>
                  {card.answer}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-mono"
                  style={{ color: "var(--text-faint)" }}>
                  <RotateCcw size={10} />
                  tap to flip back
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action bar ──────────────────────────────────────── */}
        <div className="px-4 pb-3.5 pt-1 border-t flex items-center gap-2 flex-wrap"
          style={{ borderColor: "var(--divider)" }}>
          <span className="text-[10px] font-mono mr-0.5" style={{ color: "var(--text-faint)" }}>priority:</span>
          {PRIORITIES.map((p) => (
            <button
              key={p.value!}
              onClick={() => onPriority(card.priority === p.value ? null : p.value)}
              className={priorityStyle(p.value, card.priority === p.value)}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => onDone(!card.done)}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-mono transition-all touch-manipulation"
            style={card.done ? {
              background: "rgba(16,185,129,0.18)", color: "rgb(52,211,153)",
              borderColor: "rgba(16,185,129,0.35)",
            } : {
              background: "var(--input-bg)", color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <CheckCircle2 size={12} />
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}
