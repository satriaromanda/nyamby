"use client";

import { useState, useEffect, useCallback } from "react";

export type Lang = "id" | "en";

const STORAGE_KEY = "nyamby-lang";
const EVENT_NAME = "nyamby-lang-change";

/**
 * Shared language state across components (Navbar, pages).
 * Persists to localStorage and syncs live via a custom window event,
 * so the Navbar toggle updates page copy without a reload.
 */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "id") setLangState(stored);

    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Lang>).detail;
      if (next === "en" || next === "id") setLangState(next);
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    window.dispatchEvent(new CustomEvent<Lang>(EVENT_NAME, { detail: l }));
  }, []);

  return [lang, setLang];
}
