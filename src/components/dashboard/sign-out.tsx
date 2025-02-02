'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/login') // or wherever you want to redirect after logout
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      className="button"
    >
      Sign Out
    </button>
  )
}