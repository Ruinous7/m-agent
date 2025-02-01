import { NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting login session setup...')

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    console.log('✅ Supabase client initialized')

    // Get session from request body
    const { session } = await request.json()
    console.log('📝 Received session data:', {
      hasAccessToken: !!session?.access_token,
      hasRefreshToken: !!session?.refresh_token
    }) // Log presence of tokens without exposing actual tokens

    if (!session) {
      console.error('❌ No session found in request body')
      return NextResponse.json({ error: "No session found in request body" }, { status: 400 })
    }

    console.log('🔄 Attempting to set session in cookies...')
    // Store session explicitly in cookies
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    if (error) {
      console.error("❌ Error setting session:", error)
      return NextResponse.json({ error: "Failed to set session in cookies" }, { status: 500 })
    }

    console.log("✅ Session successfully stored in cookies")
    return NextResponse.json({ success: true })
    
  } catch (err) {
    console.error("❌ Fatal error in login route:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}