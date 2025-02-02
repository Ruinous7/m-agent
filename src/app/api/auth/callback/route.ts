import { createProfile } from '@/services/profile/profileService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type'); // Check if it's a password reset flow
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    if (!code) {
      console.error('❌ No code found in URL');
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 🔥 If this is a password reset request, redirect to reset password page
    if (type === "recovery") {
      console.log("🔄 Redirecting to reset password form...");
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?code=${code}`);
    }

    // Otherwise, handle normal auth flow
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Session exchange error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
    }

    if (data.user) {
      const profileResponse = await createProfile(data.user, supabase);
      
      switch (profileResponse.status) {
        case 'profile_created':
        case 'profile_exists':
          break;
        case 'profile_creation_failed':
        case 'unexpected_error':
          console.error("⚠️ Profile creation failed:", profileResponse.error);
          return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=profile_creation_failed`);
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  } catch (error) {
    console.error('❌ Fatal error in callback route:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
  }
}
