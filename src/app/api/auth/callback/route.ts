import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    // Handle error cases
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    if (error) {
      console.error('Auth error:', { error, errorDescription })
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?error=${errorDescription}`)
    }

    console.log('Received code:', code) // Debug log

    if (!code) {
      console.log('No code found in URL') // Debug log
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`)

    } else if (code) {
      
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log('Attempting to exchange code for session...') // Debug log
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
      }

      console.log('Session established successfully:', !!data.user)

      // If we have a confirmed user, create their profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.name,
            created_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}/login`)
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error('Callback route error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
  }
}