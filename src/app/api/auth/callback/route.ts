import { createProfile } from '@/app/services/profile/profileService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    // Handle error cases
    const authError = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    if (authError) {
      console.error('❌ Auth error received:', { error: authError, errorDescription });
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?error=${errorDescription}`);
    }

    if (!code) {
      console.error('❌ No code found in URL');
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Session exchange error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
    }
    
    if (data.user) {
      const profileResponse = await createProfile(data.user, supabase);

      // Log profile status and return appropriate response
      switch (profileResponse.status) {
        case 'profile_created':
          break;
        case 'profile_exists':
          break;
        case 'profile_creation_failed':
        case 'unexpected_error':
          console.error("⚠️ Profile creation failed:", profileResponse.error);
          return NextResponse.redirect(`${requestUrl.origin}/auth-error?error=profile_creation_failed`);
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } catch (error) {
    console.error('❌ Fatal error in callback route:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
  }
}
