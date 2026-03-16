// api/delete-photo.js — hapus foto profil/cover (set null di Supabase)
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verifikasi token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token tidak ditemukan' });

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  const { type } = req.body;
  if (!type || !['avatar', 'cover'].includes(type))
    return res.status(400).json({ error: 'type harus avatar atau cover' });

  try {
    const updateData = type === 'avatar'
      ? { avatar_url: null }
      : { cover_url: null };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', decoded.id);

    if (error) return res.status(500).json({ error: 'Gagal hapus foto: ' + error.message });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[DeletePhoto]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
