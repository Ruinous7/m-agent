export type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: "user" | "admin";
    created_at?: string;  // Add this
    updated_at?: string;  // Add this
}