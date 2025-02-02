'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{error || 'An error occurred during authentication'}</p>
      <Link href="/login">Back to Login</Link>
    </div>
  )
}