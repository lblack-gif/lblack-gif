// app/api/stripe/connect/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Pull your secret key and API version from env
const stripeSecret = process.env.STRIPE_SECRET_KEY!
const stripeApiVersion = process.env.NEXT_PUBLIC_STRIPE_API_VERSION!

// Cast apiVersion to `any` so TS accepts the string at runtime
const stripe = new Stripe(stripeSecret, {
  apiVersion: stripeApiVersion as any,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  // Exchange the Connect authorization code for tokens
  const resp = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  })

  // TODO: persist resp.stripe_user_id, resp.access_token, etc. under `state` in your database

  // Redirect back into your app (e.g. a “success” page)
  return NextResponse.redirect(new URL("/connect/success", request.url))
}
