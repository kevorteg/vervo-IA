import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dcowapymieqbqiredmwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3dhcHltaWVxYnFpcmVkbXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Njk5NzYsImV4cCI6MjA4MjA0NTk3Nn0.WeaD75F3KQl1cyNrzQGy02hpR_2S-E0txJpTqjpqqVQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);