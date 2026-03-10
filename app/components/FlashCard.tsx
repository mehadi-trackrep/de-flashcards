"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { FullCard, Priority } from "../hooks/useFlashcardState";

interface Props {
  card: FullCard;
  onPriority: (p: Priority) => void;
  onDone: (done: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

const PRIORITIES: { label: string; value: Priority; color: string; active: string }[] = [
  { label: "Low",  value: "low",    color: "text-cyan-300/60 border-cyan-500/20 bg-cyan-500/5",   active: "text-cyan-300 border-cyan-500/40 bg-cyan-500/20 shadow-cyan-500/20 shadow-md scale-105" },
  { label: "Mid",  value: "medium", color: "text-amber-300/60 border-amber-500/20 bg-amber-500/5", active: "text-amber-300 border-amber-500/40 bg-amber-500/20 shadow-amber-500/20 shadow-md scale-105" },
  { label: "High", value: "high",   color: "text-rose-300/60 border-rose-500/20 bg-rose-500/5",   active: "text-rose-300 border-rose-500/40 bg-rose-500/20 shadow-rose-500/20 shadow-md scale-105" },
];

const PRIORITY_BADGE: Record<string, string> = {
  low:    "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
  medium: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  high:   "bg-rose-500/15 text-rose-300 border border-rose-500/25",
};

export default function FlashCard({ card, onPriority, onDone, onEdit, onDelete, index }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      layout
    >
      <div className={`relative rounded-2xl border transition-all duration-300 group ${
        card.done
          ? "border-emerald-500/25 bg-emerald-950/15"
          : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]"
      }`}>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{card.emoji}</span>
            <span className="text-xs font-mono text-white/25 tracking-widest uppercase">{card.topic}</span>
            {!card.isDefault && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400/70 border border-violet-500/20">custom</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {card.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${PRIORITY_BADGE[card.priority]}`}>
                {card.priority}
              </span>
            )}
            {card.done && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
                done ✓
              </span>
            )}
            {/* Edit / Delete — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit}
                className="p-1.5 rounded-lg border border-white/8 bg-white/3 text-white/30 hover:text-white/70 hover:bg-white/8 transition-all">
                <Pencil size={11} />
              </button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg border border-white/8 bg-white/3 text-white/30 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/8 transition-all">
                  <Trash2 size={11} />
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10">
                  <span className="text-xs font-mono text-rose-400">Delete?</span>
                  <button onClick={onDelete} className="text-xs font-mono text-rose-300 hover:text-rose-100 ml-1">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs font-mono text-white/30 hover:text-white/60">No</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flip area */}
        <div className="cursor-pointer px-5 pb-4 pt-2" onClick={() => setFlipped(!flipped)} style={{ perspective: "1200px" }}>
          <div style={{
            transition: "transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            minHeight: "90px",
          }}>
            {/* Front */}
            <div style={{ backfaceVisibility: "hidden" }} className="absolute inset-0 flex flex-col justify-center">
              <p className="text-white/80 text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
                {card.question}
              </p>
              <div className="mt-2 flex items-center gap-1 text-white/18 text-xs font-mono">
                <ChevronDown size={11} className="animate-bounce" />
                <span>tap to reveal</span>
              </div>
            </div>
            {/* Back */}
            <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent mb-3" />
              <p className="text-emerald-100/75 text-sm leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
                {card.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 px-5 pb-4 pt-1 border-t border-white/[0.04]">
          <span className="text-xs text-white/20 font-mono mr-1">priority:</span>
          {PRIORITIES.map((p) => (
            <button key={p.value!}
              onClick={() => onPriority(card.priority === p.value ? null : p.value)}
              className={`text-xs px-3 py-1 rounded-lg border font-mono transition-all duration-200 ${card.priority === p.value ? p.active : p.color}`}
            >{p.label}</button>
          ))}
          <div className="ml-auto">
            <button onClick={() => onDone(!card.done)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-mono transition-all duration-200 ${
                card.done
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/35 shadow-md shadow-emerald-500/15"
                  : "bg-white/4 text-white/35 border-white/8 hover:bg-white/8 hover:text-white/55"
              }`}>
              <CheckCircle2 size={12} />Done
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
