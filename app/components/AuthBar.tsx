"use client";
import { motion } from "framer-motion";
import { LogIn, LogOut, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  syncing: boolean;
}

export default function AuthBar({ syncing }: Props) {
  const { user, loading, signIn, signOutUser } = useAuth();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-end mb-6"
    >
      {user ? (
        <div className="flex items-center gap-3">
          {syncing ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400/70">
              <Loader2 size={11} className="animate-spin" />
              <span>syncing…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400/60">
              <Cloud size={11} />
              <span>cloud saved</span>
            </div>
          )}
          <div className="w-px h-4 bg-white/10" />
          <img
            src={user.photoURL ?? ""}
            alt={user.displayName ?? ""}
            className="w-6 h-6 rounded-full ring-1 ring-white/20"
          />
          <span className="text-xs font-mono text-white/40 hidden sm:block">
            {user.displayName?.split(" ")[0]}
          </span>
          <button
            onClick={signOutUser}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-white/8 bg-white/3 text-white/30 hover:text-white/60 hover:bg-white/6 transition-all"
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/25">
            <CloudOff size={11} />
            <span>local only</span>
          </div>
          <button
            onClick={signIn}
            className="flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all shadow-lg shadow-cyan-500/5"
          >
            <LogIn size={12} />
            Sign in with Google
          </button>
        </div>
      )}
    </motion.div>
  );
}
