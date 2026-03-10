"use client";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden pt-safe"
      style={{ background: "var(--bg)" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[5%] w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "var(--blob1)" }} />
        <div className="absolute bottom-[-15%] right-[5%] w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: "var(--blob2)" }} />
        <div className="absolute inset-0 opacity-100"
          style={{ backgroundImage: "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Theme toggle */}
      <button onClick={toggle}
        className="fixed top-4 right-4 z-20 p-2.5 rounded-xl border transition-all touch-manipulation"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full border"
          style={{ borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.08)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase" style={{ color: "rgba(52,211,153,0.8)" }}>
            Data Engineering
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight mb-3 leading-[1.1]"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Master the
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
            Fundamentals
          </span>
        </h1>

        <p className="text-sm font-mono mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          30 flashcards · 8 DE topics<br />
          Track priorities, sync across devices
        </p>

        {/* Topic chips */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-10">
          {["🗄️ SQL", "📐 Modeling", "⚙️ ETL", "🌊 Streaming", "🏛️ Warehouse", "☁️ Cloud", "🐍 Python", "🎼 Orchestration"].map((t) => (
            <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-muted)" }}>
              {t}
            </span>
          ))}
        </div>

        {/* Sign in button */}
        <button onClick={signIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-200 text-sm font-mono touch-manipulation active:scale-[0.98]"
          style={{ borderColor: "var(--border-hover)", background: "var(--bg-card-hover)", color: "var(--text-primary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-5 text-[11px] font-mono" style={{ color: "var(--text-faint)" }}>
          progress syncs to Firestore across all devices
        </p>
      </motion.div>
    </div>
  );
}
