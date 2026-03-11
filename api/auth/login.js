import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // atau anon key juga boleh, tapi lebih aman pake service role untuk server
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Kirim session token ke client (bisa disimpan di cookie atau localStorage)
    res.status(200).json({
      user: data.user,
      session: data.session
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}