// app/providers.tsx
'use client'

import { SessionProvider } from "next-auth/react"
import { ShoppingCartProvider } from "@/context/shoppingCart";

export function Providers({ 
    children 
  }) {
  return (
    <ShoppingCartProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ShoppingCartProvider>
  )
}