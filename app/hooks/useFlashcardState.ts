"use client";
import { useState, useEffect, useCallback } from "react";
import {
  doc, setDoc, onSnapshot, collection,
  writeBatch, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_FLASHCARDS, DEFAULT_TOPICS, TOPIC_EMOJIS, type Flashcard } from "../data/flashcards";
import type { User } from "firebase/auth";

export type Priority = "low" | "medium" | "high" | null;

export interface CardState {
  priority: Priority;
  done: boolean;
}

export interface FullCard extends Flashcard {
  priority: Priority;
  done: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// ── Firestore paths ──────────────────────────────────────────────────────────
const cardsCol = (uid: string) => collection(db, "users", uid, "cards");
const topicsCol = (uid: string) => collection(db, "users", uid, "topics")
const topicId   = (name: string) => name.replace(/\//g, "__SLASH__");
const metaDoc  = (uid: string) => doc(db, "users", uid, "meta", "info");

// ── Seed default cards + topics once ────────────────────────────────────────
async function seedUser(uid: string) {
  const batch = writeBatch(db);

  // Seed cards
  for (const card of DEFAULT_FLASHCARDS) {
    batch.set(doc(cardsCol(uid), card.id), {
      ...card,
      priority: null,
      done: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // Seed topics
  for (const topic of DEFAULT_TOPICS) {
    batch.set(doc(topicsCol(uid), topicId(topic)), {
      name: topic,
      emoji: TOPIC_EMOJIS[topic] ?? "📌",
      isDefault: true,
      createdAt: Date.now(),
    });
  }

  // Mark seeded
  batch.set(metaDoc(uid), { seeded: true, seededAt: Date.now(), version: 1 });

  await batch.commit();
}

export function useFlashcardState(user: User) {
  const [cards, setCards]   = useState<FullCard[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ── Subscribe to Firestore ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    setSyncing(true);

    // Check if seeded, seed if not
    const initSeed = async () => {
      const { getDoc } = await import("firebase/firestore");
      const snap = await getDoc(metaDoc(user.uid));
      if (!snap.exists() || !snap.data()?.seeded) {
        await seedUser(user.uid);
      }
    };
    initSeed();

    // Real-time cards listener
    const unsubCards = onSnapshot(cardsCol(user.uid), (snap) => {
      const next: FullCard[] = snap.docs.map((d) => d.data() as FullCard);
      next.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      setCards(next);
      setLoaded(true);
      setSyncing(false);
    });

    // Real-time topics listener
    const unsubTopics = onSnapshot(topicsCol(user.uid), (snap) => {
      const names = snap.docs.map((d) => (d.data() as { name: string }).name);
      names.sort();
      setTopics(names);
    });

    return () => { unsubCards(); unsubTopics(); };
  }, [user]);

  // ── Card CRUD ─────────────────────────────────────────────────────────────

  const updateCardState = useCallback(async (id: string, patch: Partial<CardState>) => {
    setSyncing(true);
    await setDoc(doc(cardsCol(user.uid), id), { ...patch, updatedAt: Date.now() }, { merge: true });
    setSyncing(false);
  }, [user]);

  const createCard = useCallback(async (data: Omit<Flashcard, "id" | "isDefault">) => {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const card: FullCard = {
      ...data,
      id,
      isDefault: false,
      priority: null,
      done: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(cardsCol(user.uid), id), card);
  }, [user]);

  const updateCard = useCallback(async (id: string, data: Partial<Omit<Flashcard, "id" | "isDefault">>) => {
    setSyncing(true);
    await setDoc(doc(cardsCol(user.uid), id), { ...data, updatedAt: Date.now() }, { merge: true });
    setSyncing(false);
  }, [user]);

  const deleteCard = useCallback(async (id: string) => {
    await deleteDoc(doc(cardsCol(user.uid), id));
  }, [user]);

  // ── Topic CRUD ────────────────────────────────────────────────────────────

  const createTopic = useCallback(async (name: string, emoji: string) => {
    await setDoc(doc(topicsCol(user.uid), topicId(name)), {
      name, emoji, isDefault: false, createdAt: Date.now(),
    });
  }, [user]);

  const deleteTopic = useCallback(async (name: string) => {
    await deleteDoc(doc(topicsCol(user.uid), topicId(name)));
  }, [user]);

  const setPriority = (id: string, priority: Priority) => updateCardState(id, { priority });
  const setDone     = (id: string, done: boolean)       => updateCardState(id, { done });
  const getCard     = (id: string) => cards.find((c) => c.id === id);

  return {
    cards, topics, loaded, syncing,
    setPriority, setDone, getCard,
    createCard, updateCard, deleteCard,
    createTopic, deleteTopic,
  };
}
