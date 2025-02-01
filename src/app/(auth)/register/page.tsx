"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.scss";
import { supabase } from "@/lib/supabaseClient";

interface RegisterForm {
  email: string;
  password: string;
  name: string; // Additional user data
}

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

interface EmailCheckResult {
  status: "confirmed" | "unconfirmed" | "new" | "profile_missing";
}
async function checkEmailStatus(email: string): Promise<EmailCheckResult> {
  // Call the RPC function to get user ID & confirmation status
  const { data, error } = await supabase.rpc("get_user_status_by_email", { email });

  if (error) {
    console.error("Error checking user:", error);
    return { status: "new" }; // Assume new if there's an error
  }

  if (data?.length > 0) {
    const user = data[0]; // RPC returns an array, take the first element

    if (user.confirmed_at) {
      // Email is confirmed, check if profile exists
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id) 
        .single();

      return profileData ? { status: "confirmed" } : { status: "profile_missing" };
    } else {
      return { status: "unconfirmed" }; // Email is unconfirmed
    }
  }

  return { status: "new" }; // If no user is found
}

export default function Register() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    name: "",
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
          }
      });

  
        if (error) throw error;
  
        localStorage.setItem("registrationData", JSON.stringify({
          name: formData.name,
          email: formData.email
        }));

        setError("This email is already registered. but not confirmed. Please check your email for a confirmation link.");
        setFormData({ email: "", password: "", name: "" });
        setTimeout(() => { router.push("/check-email");},1500)
       
        return;
      }

      
      if (emailStatus.status === "profile_missing") {
        setError("This email is already registered and confirmed. please login.");
        setFormData({ email: "", password: "", name: "" });
        setTimeout(() => { router.push("/login");},1500)
        return;
      }
  
      // If no user exists, proceed with sign-up
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
          }
        }
      });

  
      if (authError) throw authError;
  
      localStorage.setItem("registrationData", JSON.stringify({
        name: formData.name,
        email: formData.email
      }));
  
      setFormData({ email: "", password: "", name: "" });
      router.push("/check-email");
    } catch (error) {
      console.error("[Registration Error]", error);
      setError(error instanceof Error ? error.message : "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <form
        onSubmit={handleRegister}
        className={styles.form}
        autoComplete="off"
      >
        <h1>Create Account</h1>
        {error && <div className={styles.error}>{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className={styles.links}>
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
