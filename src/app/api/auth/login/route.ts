import { NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get session from request body
    const { session } = await request.json()

    if (!session) {
      return NextResponse.json({ error: "No session found in request body" }, { status: 400 })
    }

    // 🔥 Store session explicitly in cookies
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    if (error) {
      console.error("Error setting session:", error)
      return NextResponse.json({ error: "Failed to set session in cookies" }, { status: 500 })
    }

    console.log("✅ Session stored in cookies:", session)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}