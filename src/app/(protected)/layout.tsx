import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('Protected layout error:', error?.message)
      redirect('/login')
    }

    return (
      <main>
        {children}
      </main>
    )
  } catch (error) {
    console.error('Protected layout error:', error)
    redirect('/login')
  }
}