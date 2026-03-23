import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { rolePermissions } from "@/lib/modules"

export type UserRole = keyof typeof rolePermissions

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

/**
 * Extract and verify the current user from a request.
 * Reads the Supabase access token from the Authorization header.
 * Returns the user or null if unauthenticated.
 */
export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.slice(7)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  // Role is stored in user_metadata or app_metadata depending on your Supabase setup
  const role: UserRole =
    (user.app_metadata?.role as UserRole) ||
    (user.user_metadata?.role as UserRole) ||
    "field_worker"

  return {
    id: user.id,
    email: user.email || "",
    role,
  }
}

/**
 * Check if a role has admin-level access (hud_admin).
 */
export function isAdmin(role: UserRole): boolean {
  return role === "hud_admin"
}

/**
 * Return a 401 JSON response.
 */
export function unauthorizedResponse(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Return a 403 JSON response.
 */
export function forbiddenResponse(message = "Admin access required") {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Simple in-memory rate limiter.
 * Tracks request counts per key within a sliding window.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean expired entry
  if (entry && now > entry.resetAt) {
    rateLimitStore.delete(key)
  }

  const current = rateLimitStore.get(key)

  if (!current) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetAt: current.resetAt,
  }
}

/**
 * Return a 429 JSON response with Retry-After header.
 */
export function rateLimitResponse(resetAt: number) {
  const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000)
  return NextResponse.json(
    { error: "Rate limit exceeded. Try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  )
}
