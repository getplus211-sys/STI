import { createClient } from '@supabase/supabase-js';

// Vercel Environment Variables ને Access કરવા માટે
const SUPABASE_URL = "https://bhmycvrbucmbbrpzeane.supabase.co";
// **તમે આ કી Vercel ડેશબોર્ડમાં ઉમેરશો**
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// Service Role Key નો ઉપયોગ કરીને Supabase ક્લાયન્ટ બનાવો
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false // Server-side પર સેશન જાળવવાની જરૂર નથી
  }
});

export default async function handler(req, res) {
  // માત્ર POST વિનંતીઓ જ સ્વીકારો
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in request body' });
  }

  try {
    // 1. Supabase Payments Table માં ચેક કરો
    const { data, error } = await supabaseAdmin
      .from('payments') // Table name: payments
      .select('status')
      .eq('user_id', user_id) // Field: user_id
      .eq('status', 'SUCCESS') // Payment Status Check
      .limit(1);

    if (error) {
      console.error('Supabase Query Error:', error);
      return res.status(500).json({ error: 'Database access error' });
    }

    // 2. એક્સેસ નક્કી કરો
    const hasPaidAccess = data && data.length > 0;

    return res.status(200).json({ hasAccess: hasPaidAccess });

  } catch (err) {
    console.error('Serverless Function Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
