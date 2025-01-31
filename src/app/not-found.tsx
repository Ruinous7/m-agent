import Link from 'next/link'
import styles from '@/styles/not-found.module.scss'

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className={styles.homeLink}>
        Go to Home
      </Link>
    </div>
  )
}