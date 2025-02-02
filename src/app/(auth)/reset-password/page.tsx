"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../register/register.module.scss";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setStatus({ loading: false, message: "Invalid reset link." });
    }
  }, [code]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, message: "" });

    if (!code) {
      setStatus({ loading: false, message: "Invalid or missing reset code." });
      return;
    }

    // ✅ Use Supabase to update the user's password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ loading: false, message: `⚠️ ${error.message}` });
    } else {
      setStatus({ loading: false, message: "✅ Password updated! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Reset Your Password</h2>
        {status.message && <p className={styles.message}>{status.message}</p>}
        {!status.message.includes("Redirecting") && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required 
            />
            <button 
              type="submit" 
              className={styles.button} 
              disabled={status.loading}
            >
              {status.loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
