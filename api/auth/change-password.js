// api/auth/change-password.js
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token tidak ditemukan' });

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  const { old_password, new_password } = req.body;
  if (!old_password || !new_password)
    return res.status(400).json({ error: 'Password lama dan baru wajib diisi' });

  if (new_password.length < 6)
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });

  try {
    // Ambil password hash saat ini
    const { data: user, error } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', decoded.id)
      .single();

    if (error || !user)
      return res.status(404).json({ error: 'User tidak ditemukan' });

    // Verifikasi password lama
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Password lama tidak sesuai' });

    // Hash password baru
    const new_hash = await bcrypt.hash(new_password, 12);

    // Update ke DB
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password_hash: new_hash })
      .eq('id', decoded.id);

    if (updateError)
      return res.status(500).json({ error: 'Gagal update password' });

    return res.status(200).json({ message: 'Password berhasil diganti' });

  } catch (err) {
    console.error('[ChangePass]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
