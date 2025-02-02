"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "@/styles/auth.module.scss";
import { checkEmailStatus } from "@/services/profile/profileService";

export default function ForgotPassword() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
            },
          });

          if (resendError) throw resendError;

          setError(
            "Your email is not confirmed. A new confirmation email has been sent. Please check your inbox."
          );
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
    <Fragment>
      <h2>Reset Password</h2>
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleResetPassword} className={styles.form}>
          {success ? (
            <div className={styles.success}>
              Check your email for the password reset link!
              <div className={styles.links}>
                <Link href="/login">Back to Login</Link>
              </div>
            </div>
          ) : (
            <Fragment>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <br />
            </Fragment>
          )}
        </form>
        <div className={styles.links}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </Fragment>
  );
}
