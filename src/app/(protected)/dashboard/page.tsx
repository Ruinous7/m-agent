'use client'

import { useSession } from '@/lib/session'

export default function Dashboard() {
  const session = useSession()
  
  if (!session) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      {/* Rest of your dashboard */}
    </div>
  )
}