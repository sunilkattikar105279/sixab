// lib/useAuth.js
// Client-side auth hook for SIXXAB
// Usage: const { user, loading, logout } = useAuth()

import { useState, useEffect } from "react"
import { useRouter } from "next/router"

export function useAuth({ required = false, redirectTo = "/login" } = {}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sixxab_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch {
      sessionStorage.removeItem("sixxab_user")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && required && !user) {
      const current = encodeURIComponent(router.asPath)
      router.replace(`${redirectTo}?redirect=${current}`)
    }
  }, [loading, required, user, router, redirectTo])

  function logout() {
    sessionStorage.removeItem("sixxab_user")
    setUser(null)
    router.replace("/login")
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates }
    sessionStorage.setItem("sixxab_user", JSON.stringify(updated))
    setUser(updated)
  }

  return { user, loading, logout, updateUser }
}

export function getServerUser(req) {
  // Server-side auth check — reads token from cookie or header
  // For full implementation use Supabase or NextAuth
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer tok_")) return null
  return { authenticated: true }
}
