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

const COMMON_EMOJIS = ["📌","🔥","💡","⚡","🎯","🧩","🔍","📊","🛠️","🚀","📝","🌐"];

export default function CardModal({ open, onClose, onSave, topics, initialData, onCreateTopic, mode }: Props) {
  const [topic, setTopic]       = useState(topics[0] ?? "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [emoji, setEmoji]       = useState("📌");
  const [newTopic, setNewTopic] = useState("");
  const [newTopicEmoji, setNewTopicEmoji] = useState("📌");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [saving, setSaving]     = useState(false);

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-lg bg-[#0f1420] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-sm font-mono text-white/60">
                  {mode === "create" ? "New Flashcard" : "Edit Flashcard"}
                </span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Topic row */}
              <div>
                <label className="text-xs font-mono text-white/30 mb-2 block">Topic</label>
                <div className="flex gap-2">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white/70 focus:outline-none focus:border-cyan-500/40 focus:bg-white/8"
                  >
                    {topics.map((t) => <option key={t} value={t} className="bg-[#0f1420]">{t}</option>)}
                  </select>
                  <button
                    onClick={() => setShowTopicForm(!showTopicForm)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white/70 text-xs font-mono transition-all"
                  >
                    <Plus size={12} /> New
                  </button>
                </div>

                {/* New topic inline form */}
                <AnimatePresence>
                  {showTopicForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="flex gap-2 p-3 rounded-xl bg-white/3 border border-white/8">
                        <select
                          value={newTopicEmoji}
                          onChange={(e) => setNewTopicEmoji(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                        >
                          {COMMON_EMOJIS.map(e => <option key={e} value={e} className="bg-[#0f1420]">{e}</option>)}
                        </select>
                        <input
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          placeholder="Topic name…"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white/70 placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
                          onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                        />
                        <button onClick={handleAddTopic}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono hover:bg-cyan-500/25 transition-all"
                        >Add</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Emoji */}
              <div>
                <label className="text-xs font-mono text-white/30 mb-2 block">Card Icon</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`w-9 h-9 rounded-lg border text-lg transition-all ${emoji === e ? "border-cyan-500/40 bg-cyan-500/15 scale-110" : "border-white/8 bg-white/3 hover:bg-white/8"}`}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="text-xs font-mono text-white/30 mb-2 block">Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={2}
                  placeholder="What is…?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/20 font-mono focus:outline-none focus:border-cyan-500/40 focus:bg-white/8 resize-none"
                  style={{ fontFamily: "'Lora', serif" }}
                />
              </div>

              {/* Answer */}
              <div>
                <label className="text-xs font-mono text-white/30 mb-2 block">Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="The answer is…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-white/8 resize-none"
                  style={{ fontFamily: "'Lora', serif" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8">
              <button onClick={onClose} className="px-4 py-2 rounded-xl border border-white/8 bg-white/3 text-white/40 text-sm font-mono hover:text-white/60 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!question.trim() || !answer.trim() || !topic || saving}
                className="px-5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300 text-sm font-mono hover:bg-cyan-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Saving…" : mode === "create" ? "Create Card" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
