// app/api/stripe/connect/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripeApiVersion = process.env.NEXT_PUBLIC_STRIPE_API_VERSION

// ✅ Skip logic if required Stripe config is missing
if (!stripeSecret || !stripeApiVersion) {
  console.warn("⚠️ STRIPE_SECRET_KEY or STRIPE_API_VERSION is missing. Skipping Stripe callback route.")
}

export async function GET(request: NextRequest) {
  // ✅ Prevent build crash by checking env again inside the handler
  if (!stripeSecret || !stripeApiVersion) {
    return NextResponse.json(
      { error: "Stripe not configured. Missing env vars." },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: stripeApiVersion as any,
  })

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  const resp = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  })

  // TODO: persist resp.stripe_user_id, resp.access_token, etc. using `state`

  return NextResponse.redirect(new URL("/connect/success", request.url))
}
