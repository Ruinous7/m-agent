import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🚀 Starting auth callback process...')
  const requestUrl = new URL(request.url)
  console.log('📍 Request URL:', requestUrl.toString())

  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    console.log('📝 Received params:', { code: !!code, next }) // Don't log actual code for security
    
    // Handle error cases
    const authError = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    if (authError) {
      console.error('❌ Auth error received:', { error: authError, errorDescription })
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?error=${errorDescription}`)
    }

    if (!code) {
      console.error('❌ No code found in URL')
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
    }

    console.log('✅ Auth code verified, proceeding with session exchange')
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    console.log('✅ Supabase client initialized')
    
    console.log('🔄 Attempting to exchange code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Session exchange error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
    }

    console.log('✅ Session established successfully:', { 
      userId: data.user?.id,
      hasUser: !!data.user 
    })

    // If we have a confirmed user, create their profile
    if (data.user) {
      console.log('👤 Attempting to create user profile...')
      console.log('📝 Profile data:', {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
      })

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name,
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('⚠️ Profile creation error:', profileError)
      } else {
        console.log('✅ Profile created successfully')
      }

      console.log('🔄 Redirecting to login page...')
      return NextResponse.redirect(`${requestUrl.origin}/login`)
    }

    console.log('➡️ Redirecting to:', next)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error('❌ Fatal error in callback route:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
  }
}