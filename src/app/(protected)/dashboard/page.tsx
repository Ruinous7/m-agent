import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import styles from '@/styles/dashboard.module.scss'
import SignOutButton from '@/components/dashboard/sign-out'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: async () => cookieStore })
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return <div>Error loading user data</div>
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2>Dashboard</h2>
        <div className={styles.sidebar__footer}>
          <SignOutButton />
        </div>
        <nav className={styles.sidebar__nav}>
          <Link href="/dashboard" className={`${styles.sidebar__link} ${styles['sidebar__link--active']}`}>
            Overview
          </Link>
          <Link href="/dashboard/profile" className={styles.sidebar__link}>
            Profile
          </Link>
          <Link href="/dashboard/settings" className={styles.sidebar__link}>
            Settings
          </Link>
          <Link href="/dashboard/notifications" className={styles.sidebar__link}>
            Notifications
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.main__header}>
          <h1>Welcome, {user.email}</h1>
        </header>

        <div className={styles.main__content}>
          <div className={styles.user_info}>
            <div className={styles.user_info__item}>
              <h3>Account Information</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleDateString()}</p>
            </div>

            <div className={styles.user_info__item}>
              <h3>Quick Actions</h3>
              <button className="button">Edit Profile</button>
              <button className="button">Update Settings</button>
            </div>

            <div className={styles.user_info__item}>
              <h3>Account Status</h3>
              <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
              <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}