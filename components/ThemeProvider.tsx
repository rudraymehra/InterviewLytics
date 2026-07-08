"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

// Dark-only: the product's cyberpunk identity is designed for dark surfaces.
// forcedTheme pins every visitor to dark regardless of system/stored preference.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      storageKey="il-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
