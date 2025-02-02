import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.error('🔒 Middleware running on path:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()


    // If there's no session and trying to access protected routes
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If there's a session and trying to access auth pages
    if (session && (
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/register'
    )) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('❌ Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Change matcher to only run on specific routes that need protection
export const config = {
  matcher: [
    '/dashboard/:path*',  // Protect all dashboard routes
    '/login',
    '/register',
  ]
}