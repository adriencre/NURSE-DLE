import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmeeuqnfngwguauatkat.supabase.co';
const supabaseAnonKey = 'sb_publishable_fAxDYjEVQU2HRtY4Pfjb5w_uR_zM3rW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


