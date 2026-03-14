// api/auth/login.js
// Login dengan username + password (tanpa email)

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    // Cari user berdasarkan username
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, username, password_hash, coins')
      .eq('username', username.trim().toLowerCase())
      .single();

    if (error || !user)
      return res.status(401).json({ error: 'Username atau password salah' });

    // Verifikasi password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Username atau password salah' });

    // Buat JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      session: {
        access_token: token,
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
        user: { id: user.id, username: user.username }
      },
      profile: { id: user.id, username: user.username, coins: user.coins }
    });

  } catch (err) {
    console.error('[Login]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
