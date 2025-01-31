import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SessionProvider } from '@/lib/session';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
   const cookieStore = cookies()
   const supabase = createServerComponentClient({ cookies: () => cookieStore })
   const { data: { session } } = await supabase.auth.getSession()

   if (!session) {
    redirect('/login')
   }

   return (
    <main>
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    </main>
   )
}