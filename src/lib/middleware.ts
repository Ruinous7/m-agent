import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is in the protected directory
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('User is not signed in and trying to access dashboard')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and trying to access login page, redirect to dashboard
  if (session && req.nextUrl.pathname === '/login') {
    console.log('User is signed in and trying to access login page')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/check-email',
  ],
}