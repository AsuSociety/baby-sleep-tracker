import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	// Helpful debug output when env vars are missing locally
	// (will appear in terminal where Next.js runs and in server logs)
	// Do NOT expose keys in public logs; this only logs presence/absence.
	console.error("Supabase env vars missing:", {
		hasUrl: Boolean(supabaseUrl),
		hasAnonKey: Boolean(supabaseAnonKey),
	});
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
