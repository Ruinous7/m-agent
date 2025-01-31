'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../register/register.module.scss'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className={styles.container}>
      <h1>Authentication Error</h1>
      <p>{error || 'An error occurred during authentication'}</p>
      <Link href="/login">Back to Login</Link>
    </div>
  )
}