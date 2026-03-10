"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, BookOpen, BarChart3, RotateCcw, Plus, LogOut, Cloud, Loader2 } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useFlashcardState, type Priority } from "./hooks/useFlashcardState";
import SignInScreen from "./components/SignInScreen";
import FlashCard from "./components/FlashCard";
import StatsBar from "./components/StatsBar";
import CardModal from "./components/CardModal";

type Mode = "mix" | "topic" | "priority";
type PriorityFilter = Priority | "done" | "unset";

const PRIORITY_FILTERS: { label: string; value: PriorityFilter; color: string; active: string }[] = [
  { label: "All",    value: null,    color: "text-white/45 border-white/10 bg-white/4",          active: "text-white border-white/25 bg-white/10" },
  { label: "High",   value: "high",  color: "text-rose-300/55 border-rose-500/18 bg-rose-500/4", active: "text-rose-300 border-rose-500/40 bg-rose-500/15" },
  { label: "Medium", value: "medium",color: "text-amber-300/55 border-amber-500/18 bg-amber-500/4", active: "text-amber-300 border-amber-500/40 bg-amber-500/15" },
  { label: "Low",    value: "low",   color: "text-cyan-300/55 border-cyan-500/18 bg-cyan-500/4",  active: "text-cyan-300 border-cyan-500/40 bg-cyan-500/15" },
  { label: "Done ✓", value: "done",  color: "text-emerald-300/55 border-emerald-500/18 bg-emerald-500/4", active: "text-emerald-300 border-emerald-500/40 bg-emerald-500/15" },
  { label: "Unset",  value: "unset", color: "text-white/25 border-white/8 bg-white/3",            active: "text-white/65 border-white/18 bg-white/8" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Loading splash ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-mono text-white/20">loading…</span>
      </div>
    </div>
  );
}

// ── Main app (requires signed-in user) ─────────────────────────────────────
function App() {
  const { user, signOutUser } = useAuth();
  const {
    cards, topics, loaded, syncing,
    setPriority, setDone,
    createCard, updateCard, deleteCard,
    createTopic,
  } = useFlashcardState(user!);

  const [mode, setMode]               = useState<Mode>("mix");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(null);
  const [shuffleKey, setShuffleKey]   = useState(0);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  // Update selectedTopic when topics load
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
  }, [mode, selectedTopic, priorityFilter, shuffledCards, cards]);

  const editCard = cards.find((c) => c.id === editingCard);

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[8%]  w-[600px] h-[600px] rounded-full bg-cyan-500/4  blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/4 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-violet-500/3 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Top bar: user + sync status */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {syncing ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400/60">
              <Loader2 size={11} className="animate-spin" /><span>syncing…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/50">
              <Cloud size={11} /><span>synced</span>
            </div>
          )}
          <div className="w-px h-4 bg-white/8" />
          {user?.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-white/15" />}
          <span className="text-xs font-mono text-white/35 hidden sm:block">{user?.displayName?.split(" ")[0]}</span>
          <button onClick={signOutUser}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-white/8 bg-white/3 text-white/25 hover:text-white/55 hover:bg-white/6 transition-all">
            <LogOut size={11} />Sign out
          </button>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400/65 tracking-[0.2em] uppercase">Data Engineering</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Fundamentals
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Flash Cards</span>
            </h1>
            <button onClick={() => { setEditingCard(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-mono hover:bg-cyan-500/18 hover:border-cyan-500/45 transition-all shadow-lg shadow-cyan-500/5 shrink-0 mt-1">
              <Plus size={14} />New Card
            </button>
          </div>
          <p className="text-white/25 text-sm font-mono mt-3">
            {cards.length} cards · {topics.length} topics · ☁ synced to cloud
          </p>
        </motion.div>

        {/* Stats */}
        {loaded && <StatsBar cards={cards} />}

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { mode: "mix",      icon: Shuffle,   label: "Mix"      },
            { mode: "topic",    icon: BookOpen,  label: "By Topic" },
            { mode: "priority", icon: BarChart3, label: "Priority" },
          ] as const).map(({ mode: m, icon: Icon, label }) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono transition-all duration-200 ${mode === m ? "bg-white/10 border-white/20 text-white" : "bg-white/3 border-white/8 text-white/38 hover:text-white/58 hover:bg-white/5"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
          {mode === "mix" && (
            <button onClick={() => setShuffleKey(k => k + 1)}
              className="ml-auto px-3 py-2 rounded-xl border border-white/8 bg-white/3 text-white/25 font-mono hover:text-white/55 hover:bg-white/5 transition-all" title="Re-shuffle">
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        {/* Sub-filters */}
        <AnimatePresence mode="wait">
          {mode === "topic" && (
            <motion.div key="tf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button key={t} onClick={() => setSelectedTopic(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all duration-200 ${selectedTopic === t ? "bg-cyan-500/18 border-cyan-500/38 text-cyan-300" : "bg-white/3 border-white/8 text-white/38 hover:text-white/58 hover:bg-white/5"}`}
                  >{t}</button>
                ))}
              </div>
            </motion.div>
          )}
          {mode === "priority" && (
            <motion.div key="pf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {PRIORITY_FILTERS.map((f) => (
                  <button key={String(f.value)} onClick={() => setPriorityFilter(f.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all duration-200 ${priorityFilter === f.value ? f.active : f.color}`}
                  >{f.label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Count */}
        <div className="text-xs font-mono text-white/18 mb-4">
          {displayedCards.length} card{displayedCards.length !== 1 ? "s" : ""}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          {!loaded ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs font-mono text-white/20">Loading your cards…</span>
            </motion.div>
          ) : displayedCards.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-white/20 font-mono text-sm">
              No cards here yet.
              <br /><span className="text-white/12">Try a different filter or add a new card!</span>
            </motion.div>
          ) : (
            <motion.div key={`${mode}-${selectedTopic}-${priorityFilter}`} className="flex flex-col gap-4">
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

        <div className="mt-16 text-center text-xs font-mono text-white/10">
          signed in as {user?.email} · firestore sync active
        </div>
      </div>

      {/* Create / Edit modal */}
      <CardModal
        open={modalOpen}
        mode={editingCard ? "edit" : "create"}
        topics={topics}
        initialData={editCard ? { topic: editCard.topic, question: editCard.question, answer: editCard.answer, emoji: editCard.emoji } : null}
        onClose={() => { setModalOpen(false); setEditingCard(null); }}
        onCreateTopic={createTopic}
        onSave={async (data) => {
          if (editingCard) {
            await updateCard(editingCard, data);
          } else {
            await createCard(data);
          }
        }}
      />
    </div>
  );
}

// ── Root: gate behind auth ──────────────────────────────────────────────────
export default function Home() {
  const { user, loading } = useAuth();
  if (loading)   return <LoadingScreen />;
  if (!user)     return <SignInScreen />;
  return <App />;
}
