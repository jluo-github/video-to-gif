"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Simple external store for hydration state
const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Use useSyncExternalStore to check if we're mounted (client-side)
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true, // Client: return true
    () => false // Server: return false
  );

  if (!mounted) {
    return (
      <button className='relative h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm' />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className='relative h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 flex items-center justify-center group'
      aria-label='Toggle theme'>
      <Sun className='h-5 w-5 text-purple-300 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0' />
      <Moon className='h-5 w-5 text-purple-400 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100' />
      <div className='absolute inset-0 rounded-full bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
    </button>
  );
}
