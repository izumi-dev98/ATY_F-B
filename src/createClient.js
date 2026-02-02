import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
    'https://dkowwppjgqwevggcwwdx.supabase.co',
    "sb_publishable_xHz3WpRLZdPpkUcp5onqSQ_a4oofrqT"
)

export default supabase