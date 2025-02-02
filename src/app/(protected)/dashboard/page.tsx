'use client'

import { useSession } from '@/lib/utils/contexts/session'

export default function Dashboard() {
  const session = useSession()
  
  if (!session) {
    return <div>Loading...</div>
  }

  console.log('dashboard session', session)
  
  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      {/* Rest of your dashboard */}
    </div>
  )
}