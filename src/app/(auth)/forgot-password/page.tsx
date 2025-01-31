'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './forgot-password.module.scss'

export default function ForgotPassword() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // ✅ Step 1: Check if the email exists in Supabase
      const { data, error: fetchError } = await supabase
        .from('users') // Make sure you have a 'users' table with emails
        .select('email')
        .eq('email', email)
        .single()

      if (fetchError || !data) {
        throw new Error("No account found with that email.")
      }

      // ✅ Step 2: Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) throw error

      setSuccess(true) // Show success message
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleResetPassword} className={styles.form}>
        <h1>Reset Password</h1>
        {error && <div className={styles.error}>{error}</div>}
        {success ? (
          <div className={styles.success}>
            Check your email for the password reset link!
            <div className={styles.links}>
              <Link href="/login">Back to Login</Link>
            </div>
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className={styles.links}>
              <Link href="/login">Back to Login</Link>
            </div>
          </>
        )}
      </form>
    </div>
  )
}