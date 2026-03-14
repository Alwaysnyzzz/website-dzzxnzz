// api/auth/register.js
// Daftar hanya dengan username + password (tanpa email)
// Butuh: npm install bcryptjs jsonwebtoken

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

  // Validasi
  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });

  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername.length < 3)
    return res.status(400).json({ error: 'Username minimal 3 karakter' });

  if (!/^[a-z0-9_]+$/.test(cleanUsername))
    return res.status(400).json({ error: 'Username hanya boleh huruf, angka, dan underscore' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password minimal 6 karakter' });

  try {
    // Cek username sudah ada
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (existing)
      return res.status(400).json({ error: 'Username sudah digunakan' });

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Simpan user baru
    const { data: newUser, error: insertError } = await supabase
      .from('profiles')
      .insert({ username: cleanUsername, password_hash, coins: 0 })
      .select('id, username, coins')
      .single();

    if (insertError)
      return res.status(500).json({ error: 'Gagal membuat akun: ' + insertError.message });

    // Buat JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Akun berhasil dibuat',
      session: {
        access_token: token,
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
        user: { id: newUser.id, username: newUser.username }
      },
      profile: { id: newUser.id, username: newUser.username, coins: newUser.coins }
    });

  } catch (err) {
    console.error('[Register]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
