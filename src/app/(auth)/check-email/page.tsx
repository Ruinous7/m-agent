"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "@/styles/auth.module.scss";

export default function CheckEmail() {
  const [resendStatus, setResendStatus] = useState<{
    loading: boolean;
    success?: string;
    error?: string;
  }>({ loading: false });
  const supabase = createClientComponentClient();

  const handleResendEmail = async () => {
    setResendStatus({ loading: true });

    // Get email from localStorage
    const savedData = localStorage.getItem("registrationData");
    if (!savedData) {
      setResendStatus({
        loading: false,
        error: "Email address not found. Please try registering again.",
      });
      return;
    }

    const { email } = JSON.parse(savedData);

    try {
      // ✅ Use `signInWithOtp` instead of `resend`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only resend confirmation, don't create a new user
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setResendStatus({
        loading: false,
        success: "Confirmation email resent successfully!",
      });
    } catch (error) {
      setResendStatus({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to resend confirmation email",
      });
    }
  };

  return (
    <Fragment>
      <h2>Check Your Email</h2>

      <div className={styles.message}>
        <p>
          We&apos;ve sent you a confirmation email. Please check your inbox and
          click the verification link to complete your registration.
        </p>

        {resendStatus.error && (
          <div className={styles.error}>{resendStatus.error}</div>
        )}
        {resendStatus.success && (
          <div className={styles.success}>{resendStatus.success}</div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={resendStatus.loading}
          className={styles.submitButton}
        >
          {resendStatus.loading ? "Sending..." : "Resend Confirmation Email"}
        </button>
        <br />

        <div className={styles.links}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </Fragment>
  );
}
