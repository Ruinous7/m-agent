import { createProfile } from '@/app/services/profile/profileService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get session from request body
    const { session } = await request.json()

    if (!session) {
      return NextResponse.json({ error: "No session found in request body" }, { status: 400 })
    }

    // ✅ Create a new response object
    const response = NextResponse.json({ success: true })
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    if (session.user) {
      // Create profile after successful authentication
      await createProfile(session.user, supabase)
    }
    
    // ✅ Securely store session ID instead of full tokens
    response.cookies.set("session_id", session.user.id, {
      httpOnly: true, // 🔥 Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // 🔥 Secure only in production
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (err) {
    console.error("❌ Fatal error in login route:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
