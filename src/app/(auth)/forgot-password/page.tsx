'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './forgot-password.module.scss'
import { checkEmailStatus } from '@/app/services/profile/profileService'

export default function ForgotPassword() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
        const emailStatus = await checkEmailStatus(email);

        const sendResetLink = async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (error) throw error;

            setSuccess(true); // Show success message
        };

        switch (emailStatus.status) {
            case "confirmed": // ✅ User is confirmed → allow reset
            case "profile_missing": // ✅ User exists but no profile → allow reset
                await sendResetLink();
                break;

            case "unconfirmed": // 🔥 User exists but not confirmed → resend confirmation email
                const { error: resendError } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        shouldCreateUser: false, // Only resend confirmation
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });

                if (resendError) throw resendError;

                setError("Your email is not confirmed. A new confirmation email has been sent. Please check your inbox.");
                return;

            case "new": // 🚫 Email not registered
                setError("This email is not registered. Please register first.");
                return;

            default:
                setError("An error occurred. Please try again.");
                return;
        }
    } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
        setLoading(false);
    }
};
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