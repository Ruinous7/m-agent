import { supabase } from "@/lib/supabase/supabaseClient";
import { Profile } from "@/lib/utils/types/profile";
import { SupabaseClient, User } from "@supabase/supabase-js";

export async function createProfile(user: User, supabase: SupabaseClient): Promise<{ status: string; error?: string }> {
  try {
    // ✅ Check if profile exists using the server-authenticated client
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("⚠️ Error checking existing profile:", fetchError);
      return { status: "profile_check_failed", error: fetchError.message };
    }

    if (existingProfile) {
      return { status: "profile_exists" };
    }


    const profileData: Profile = {
      id: user.id,
      first_name: null,
      last_name: null,
      role: "user",
    };


    // ✅ Use the server-authenticated Supabase client for the insert
    const { error: profileError } = await supabase.from("profiles").insert(profileData);

    if (profileError) {
      console.error("⚠️ Profile creation error:", profileError);
      return { status: "profile_creation_failed", error: profileError.message };
    }

    return { status: "profile_created" };
  } catch (error) {
    console.error("⚠️ Unexpected error in createProfile:", error);
    return { status: "unexpected_error", error: (error as Error).message };
  }
}

export interface EmailCheckResult {
  status: "confirmed" | "unconfirmed" | "new" | "profile_missing";
}
export async function checkEmailStatus(email: string): Promise<EmailCheckResult> {
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