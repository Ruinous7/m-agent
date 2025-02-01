import { SupabaseClient, User } from "@supabase/supabase-js";

interface ProfileData {
  id: string;
  email: string | undefined;
  name: string;
  role: "user" | "support" | "admin";
  created_at: string;
}

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


    const profileData: ProfileData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name || "",
      role: "user",
      created_at: new Date().toISOString(),
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
