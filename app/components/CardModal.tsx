"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { topic: string; question: string; answer: string; emoji: string }) => void;
  topics: string[];
  initialData?: { topic: string; question: string; answer: string; emoji: string } | null;
  onCreateTopic: (name: string, emoji: string) => Promise<void>;
  mode: "create" | "edit";
}

const EMOJIS = ["📌","🔥","💡","⚡","🎯","🧩","🔍","📊","🛠️","🚀","📝","🌐","🗄️","📐","⚙️","🌊","🏛️","☁️","🐍","🎼"];

export default function CardModal({ open, onClose, onSave, topics, initialData, onCreateTopic, mode }: Props) {
  const [topic,    setTopic]    = useState("");
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");
  const [emoji,    setEmoji]    = useState("📌");
  const [newTopic, setNewTopic] = useState("");
  const [newTopicEmoji, setNewTopicEmoji] = useState("📌");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTopic(initialData?.topic ?? topics[0] ?? "");
      setQuestion(initialData?.question ?? "");
      setAnswer(initialData?.answer ?? "");
      setEmoji(initialData?.emoji ?? "📌");
      setShowTopicForm(false);
      setNewTopic("");
    }
  }, [open, initialData, topics]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim() || !topic) return;
    setSaving(true);
    await onSave({ topic, question: question.trim(), answer: answer.trim(), emoji });
    setSaving(false);
    onClose();
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;
    await onCreateTopic(newTopic.trim(), newTopicEmoji);
    setTopic(newTopic.trim());
    setNewTopic("");
    setShowTopicForm(false);
  };

  const inputStyle = {
    background: "var(--input-bg)", borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl pb-safe"
            style={{ background: "var(--modal-bg)", border: "1px solid var(--modal-border)", maxHeight: "92vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
              style={{ borderColor: "var(--border)", background: "var(--modal-bg)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-cyan-400" />
                <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                  {mode === "create" ? "New Flashcard" : "Edit Flashcard"}
                </span>
              </div>
              <button onClick={onClose} className="p-1 touch-manipulation" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Topic */}
              <div>
                <label className="text-[11px] font-mono mb-1.5 block" style={{ color: "var(--text-muted)" }}>Topic</label>
                <div className="flex gap-2">
                  <select value={topic} onChange={(e) => setTopic(e.target.value)}
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono border focus:outline-none"
                    style={{ ...inputStyle, background: "var(--input-bg)" }}>
                    {topics.map((t) => <option key={t} value={t} style={{ background: "var(--modal-bg)" }}>{t}</option>)}
                  </select>
                  <button onClick={() => setShowTopicForm(!showTopicForm)}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-mono transition-all touch-manipulation"
                    style={{ borderColor: "var(--border)", background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                    <Plus size={12} /> New
                  </button>
                </div>
                <AnimatePresence>
                  {showTopicForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
                      <div className="flex gap-2 p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--input-bg)" }}>
                        <select value={newTopicEmoji} onChange={(e) => setNewTopicEmoji(e.target.value)}
                          className="rounded-lg px-2 py-1.5 text-sm border focus:outline-none"
                          style={{ background: "var(--modal-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                          {EMOJIS.map(e => <option key={e} value={e} style={{ background: "var(--modal-bg)" }}>{e}</option>)}
                        </select>
                        <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)}
                          placeholder="Topic name…"
                          className="flex-1 rounded-lg px-3 py-1.5 text-sm font-mono border focus:outline-none"
                          style={{ ...inputStyle, background: "var(--modal-bg)" }}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTopic()} />
                        <button onClick={handleAddTopic}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-500/12 hover:bg-cyan-500/20 touch-manipulation">
                          Add
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Emoji */}
              <div>
                <label className="text-[11px] font-mono mb-1.5 block" style={{ color: "var(--text-muted)" }}>Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className="w-9 h-9 rounded-lg border text-base transition-all touch-manipulation"
                      style={{ borderColor: emoji === e ? "rgba(6,182,212,0.5)" : "var(--border)", background: emoji === e ? "rgba(6,182,212,0.15)" : "var(--input-bg)", transform: emoji === e ? "scale(1.1)" : "scale(1)" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="text-[11px] font-mono mb-1.5 block" style={{ color: "var(--text-muted)" }}>Question</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2}
                  placeholder="What is…?" className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none resize-none"
                  style={{ ...inputStyle, fontFamily: "var(--font-serif)" }} />
              </div>

              {/* Answer */}
              <div>
                <label className="text-[11px] font-mono mb-1.5 block" style={{ color: "var(--text-muted)" }}>Answer</label>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4}
                  placeholder="The answer is…" className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none resize-none"
                  style={{ ...inputStyle, fontFamily: "var(--font-serif)" }} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t sticky bottom-0"
              style={{ borderColor: "var(--border)", background: "var(--modal-bg)" }}>
              <button onClick={onClose}
                className="px-4 py-2.5 rounded-xl border text-sm font-mono touch-manipulation"
                style={{ borderColor: "var(--border)", background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={!question.trim() || !answer.trim() || !topic || saving}
                className="px-5 py-2.5 rounded-xl border text-sm font-mono text-cyan-300 border-cyan-500/30 bg-cyan-500/15 disabled:opacity-30 touch-manipulation">
                {saving ? "Saving…" : mode === "create" ? "Create Card" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
