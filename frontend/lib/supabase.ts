import { createClient } from "@supabase/supabase-js";

// Create a client to connect to the DB
const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;  
const supabase = createClient(url, key);

export default supabase;