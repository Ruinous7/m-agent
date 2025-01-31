'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the API callback to exchange the code for a session
    router.replace(`/api/auth/callback${window.location.search}`)
  }, [router])

  return (
    <div>
      <h1>Processing authentication...</h1>
      <p>You will be redirected shortly...</p>
    </div>
  )
}