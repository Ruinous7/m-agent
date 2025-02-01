import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting profile creation process...')
    
    const { email, name } = await request.json()
    console.log('📝 Received data:', { email, name })
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    console.log('✅ Supabase client initialized')

    // First check if profile already exists
    console.log('🔍 Checking for existing profile...')
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      console.log('⚠️ Profile already exists:', existingProfile)
      return NextResponse.json(
        { error: 'A user with this email already exists' }, 
        { status: 400 }
      )
    }

    console.log('✅ No existing profile found, proceeding with creation')

    // Create temporary profile
    console.log('📝 Creating new profile...')
    const { error } = await supabase
      .from('profiles')
      .insert({
        email,
        name,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('❌ Error creating profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Profile created successfully!')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Fatal error in create-profile route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}