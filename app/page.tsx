"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, BookOpen, BarChart3, RotateCcw, Plus, LogOut, Cloud, Loader2, Sun, Moon } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import { useFlashcardState, type Priority } from "./hooks/useFlashcardState";
import SignInScreen from "./components/SignInScreen";
import FlashCard from "./components/FlashCard";
import StatsBar from "./components/StatsBar";
import CardModal from "./components/CardModal";

type Mode = "mix" | "topic" | "priority";
type PriorityFilter = Priority | "done" | "unset";

const PRIORITY_FILTERS: { label: string; value: PriorityFilter }[] = [
  { label: "All",    value: null    },
  { label: "High",   value: "high"  },
  { label: "Medium", value: "medium"},
  { label: "Low",    value: "low"   },
  { label: "Done ✓", value: "done"  },
  { label: "Unset",  value: "unset" },
];

const PRIORITY_FILTER_STYLE = (value: PriorityFilter, active: boolean): React.CSSProperties => {
  if (!active) return {};
  const colors: Record<string, React.CSSProperties> = {
    high:   { background: "rgba(239,68,68,0.15)",   color: "rgb(252,165,165)", borderColor: "rgba(239,68,68,0.35)"   },
    medium: { background: "rgba(245,158,11,0.15)",  color: "rgb(253,224,71)",  borderColor: "rgba(245,158,11,0.35)"  },
    low:    { background: "rgba(6,182,212,0.15)",   color: "rgb(103,232,249)", borderColor: "rgba(6,182,212,0.35)"   },
    done:   { background: "rgba(16,185,129,0.15)",  color: "rgb(52,211,153)",  borderColor: "rgba(16,185,129,0.35)"  },
    unset:  { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" },
    null:   { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.25)" },
  };
  return colors[String(value)] ?? {};
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>loading…</span>
      </div>
    </div>
  );
}

function App() {
  const { user, signOutUser } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    cards, topics, loaded, syncing,
    setPriority, setDone,
    createCard, updateCard, deleteCard,
    createTopic,
  } = useFlashcardState(user!);

  const [mode, setMode]             = useState<Mode>("mix");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  useMemo(() => {
    if (topics.length > 0 && !selectedTopic) setSelectedTopic(topics[0]);
  }, [topics, selectedTopic]);

  const shuffledCards = useMemo(() => shuffle(cards), [shuffleKey, cards]); // eslint-disable-line

  const displayedCards = useMemo(() => {
    if (mode === "mix") return shuffledCards;
    if (mode === "topic") return cards.filter((c) => c.topic === selectedTopic);
    if (priorityFilter === null)    return cards;
    if (priorityFilter === "done")  return cards.filter((c) => c.done);
    if (priorityFilter === "unset") return cards.filter((c) => !c.priority && !c.done);
    return cards.filter((c) => c.priority === priorityFilter && !c.done);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedTopic, priorityFilter, shuffledCards, cards]);

  const editCard = cards.find((c) => c.id === editingCard);

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[8%] w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "var(--blob1)" }} />
        <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] rounded-full blur-[100px]" style={{ background: "var(--blob2)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-safe">

        {/* ── Top bar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/10" />
            )}
            <span className="text-xs font-mono hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {user?.displayName?.split(" ")[0]}
            </span>
            {syncing ? (
              <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: "rgba(251,191,36,0.65)" }}>
                <Loader2 size={10} className="animate-spin" /><span className="hidden sm:block">syncing</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: "rgba(52,211,153,0.55)" }}>
                <Cloud size={10} /><span className="hidden sm:block">synced</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all touch-manipulation"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={signOutUser}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all touch-manipulation"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <LogOut size={12} /><span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>

        {/* ── Header ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: "rgba(52,211,153,0.65)" }}>
                  Data Engineering
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight leading-[1.1]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Fundamentals
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  Flash Cards
                </span>
              </h1>
              <p className="text-[11px] font-mono mt-2" style={{ color: "var(--text-faint)" }}>
                {cards.length} cards · {topics.length} topics
              </p>
            </div>
            <button
              onClick={() => { setEditingCard(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-mono text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/18 transition-all touch-manipulation shrink-0 mt-1">
              <Plus size={14} /><span>New</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        {loaded && <StatsBar cards={cards} />}

        {/* ── Mode tabs ─────────────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          {([
            { mode: "mix",      icon: Shuffle,   label: "Mix"     },
            { mode: "topic",    icon: BookOpen,  label: "Topic"   },
            { mode: "priority", icon: BarChart3, label: "Priority"},
          ] as const).map(({ mode: m, icon: Icon, label }) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-mono transition-all touch-manipulation"
              style={{
                background: mode === m ? "var(--bg-card-hover)" : "var(--bg-card)",
                borderColor: mode === m ? "var(--border-hover)" : "var(--border)",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
              }}>
              <Icon size={13} />{label}
            </button>
          ))}
          {mode === "mix" && (
            <button onClick={() => setShuffleKey(k => k + 1)}
              className="px-3 py-2.5 rounded-xl border transition-all touch-manipulation"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        {/* ── Sub-filters ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {mode === "topic" && (
            <motion.div key="tf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <button key={t} onClick={() => setSelectedTopic(t)}
                    className="text-[11px] px-3 py-1.5 rounded-lg border font-mono transition-all touch-manipulation"
                    style={{
                      background: selectedTopic === t ? "rgba(6,182,212,0.15)" : "var(--bg-card)",
                      borderColor: selectedTopic === t ? "rgba(6,182,212,0.40)" : "var(--border)",
                      color: selectedTopic === t ? "rgb(103,232,249)" : "var(--text-muted)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {mode === "priority" && (
            <motion.div key="pf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_FILTERS.map((f) => (
                  <button key={String(f.value)} onClick={() => setPriorityFilter(f.value)}
                    className="text-[11px] px-3 py-1.5 rounded-lg border font-mono transition-all touch-manipulation"
                    style={{
                      background: priorityFilter === f.value ? undefined : "var(--bg-card)",
                      borderColor: priorityFilter === f.value ? undefined : "var(--border)",
                      color: priorityFilter === f.value ? undefined : "var(--text-muted)",
                      ...PRIORITY_FILTER_STYLE(f.value, priorityFilter === f.value),
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Count */}
        <div className="text-[11px] font-mono mb-3" style={{ color: "var(--text-faint)" }}>
          {displayedCards.length} card{displayedCards.length !== 1 ? "s" : ""}
        </div>

        {/* ── Cards ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!loaded ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-20">
              <div className="w-6 h-6 rounded-full border-2 border-t-cyan-400 animate-spin"
                style={{ borderColor: "var(--border)", borderTopColor: "rgb(34,211,238)" }} />
              <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>Loading your cards…</span>
            </motion.div>
          ) : displayedCards.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-sm font-mono" style={{ color: "var(--text-faint)" }}>
              No cards here.<br />
              <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>Try a different filter or add a new card.</span>
            </motion.div>
          ) : (
            <motion.div key={`${mode}-${selectedTopic}-${priorityFilter}`} className="flex flex-col gap-3">
              {displayedCards.map((card, i) => (
                <FlashCard key={card.id} card={card} index={i}
                  onPriority={(p) => setPriority(card.id, p)}
                  onDone={(d) => setDone(card.id, d)}
                  onEdit={() => { setEditingCard(card.id); setModalOpen(true); }}
                  onDelete={() => deleteCard(card.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-[10px] font-mono pb-4" style={{ color: "var(--text-faint)" }}>
          {user?.email} · firestore sync
        </div>
      </div>

      {/* ── Sticky bottom nav for mobile ─────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pb-safe"
        style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around gap-2">
          {([
            { mode: "mix",      icon: Shuffle,   label: "Mix"     },
            { mode: "topic",    icon: BookOpen,  label: "Topic"   },
            { mode: "priority", icon: BarChart3, label: "Priority"},
          ] as const).map(({ mode: m, icon: Icon, label }) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all touch-manipulation"
              style={{ color: mode === m ? "rgb(34,211,238)" : "var(--text-muted)" }}>
              <Icon size={18} />
              <span className="text-[10px] font-mono">{label}</span>
            </button>
          ))}
          <button
            onClick={() => { setEditingCard(null); setModalOpen(true); }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl touch-manipulation"
            style={{ color: "rgb(34,211,238)" }}>
            <Plus size={18} />
            <span className="text-[10px] font-mono">New</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <CardModal
        open={modalOpen}
        mode={editingCard ? "edit" : "create"}
        topics={topics}
        initialData={editCard ? { topic: editCard.topic, question: editCard.question, answer: editCard.answer, emoji: editCard.emoji } : null}
        onClose={() => { setModalOpen(false); setEditingCard(null); }}
        onCreateTopic={createTopic}
        onSave={async (data) => {
          if (editingCard) await updateCard(editingCard, data);
          else await createCard(data);
        }}
      />
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <SignInScreen />;
  return <App />;
}
