"use client";

import { Fragment, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/auth.module.scss";
import { checkEmailStatus } from "@/services/profile/profileService";
import { RegisterFormState } from "@/lib/utils/interfaces/auth";

// Add password validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};

// todo ,
// organize the code
// make sure we have proper ux for unconfirmed users

export default function Register() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState<RegisterFormState>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      // Use the RPC function to check email status
      const emailStatus = await checkEmailStatus(formData.email);

      if (emailStatus.status === "confirmed") {
        setError("This email is already registered. Please log in.");
        setLoading(false);
        return;
      }

      if (emailStatus.status === "unconfirmed") {
        // Resend confirmation email
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            shouldCreateUser: false, // Only resend confirmation, don't create a new user
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        localStorage.setItem(
          "registrationData",
          JSON.stringify({
            email: formData.email,
          })
        );

        setError(
          "This email is already registered. but not confirmed. Please check your email for a confirmation link."
        );
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          router.push("/check-email");
        }, 1500);

        return;
      }

      if (emailStatus.status === "profile_missing") {
        setError(
          "This email is already registered and confirmed. please login."
        );
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      // If no user exists, proceed with sign-up
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      localStorage.setItem(
        "registrationData",
        JSON.stringify({
          email: formData.email,
        })
      );

      setFormData({ email: "", password: "" });
      router.push("/check-email");
    } catch (error) {
      console.error("[Registration Error]", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <h2>Create Account</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleRegister}>
        <div className={styles.formGroup}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button><br/>
        <div className={styles.links}>
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </form>
    </Fragment>
  );
}
