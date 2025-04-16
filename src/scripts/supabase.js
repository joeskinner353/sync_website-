// Import Supabase from CDN
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://lycmyaohsycrdergwpmq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Y215YW9oc3ljcmRlcmd3cG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTM2NjMsImV4cCI6MjA1OTE4OTY2M30.5j6yCAuQEkTCKfkFK7eETPn_2TOR9bpGUBuzsbdlRfY'

export const supabase = createClient(supabaseUrl, supabaseKey)