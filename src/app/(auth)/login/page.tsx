"use client";

import { Fragment, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/auth.module.scss";
import { LoginFormState } from "@/lib/utils/interfaces/auth";

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    loading: false,
  });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });

      if (error) throw error;

      // ✅ Send session to API for cookie storage
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: data.session }),
      });

      if (!response.ok) {
        console.error("Failed to sync session with cookies");
        throw new Error("Failed to sync session with cookies");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Fragment>
      <h2>Sign in to your account</h2>

      {formState.error && (
        <div className={styles.errorMessage}>{formState.error}</div>
      )}

      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <input
            type="email"
            placeholder="Email"
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            required
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="password"
            placeholder="Password"
            value={formState.password}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={formState.loading}
          className={styles.submitButton}
        >
          {formState.loading ? "Signing in..." : "Sign in"}
        </button><br/>
      </form>

      <div className={styles.links}>
        <Link href="/register">Create an account</Link>
        <br />
        <Link href="/forgot-password">Forgot password?</Link>
      </div>
    </Fragment>
  );
}
