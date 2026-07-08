"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = (resolvedTheme ?? theme) === "dark"

  return (
    <button
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 border-line-light bg-white text-neutral-600 hover:text-jade-700 hover:bg-jade-100 dark:bg-[#0B1122] dark:text-neutral-300 dark:border-line-dark dark:hover:text-jade-400 dark:hover:bg-jade-900/30"
   >
  {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  )
}
