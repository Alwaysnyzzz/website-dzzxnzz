import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // pakai service role untuk akses admin
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // langsung verifikasi (untuk testing)
      user_metadata: { name }
    })

    if (error) throw error

    res.status(201).json({
      user: data.user,
      message: 'Registrasi berhasil'
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}