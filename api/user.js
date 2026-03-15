// api/user.js — ambil profil + coins, verifikasi JWT custom
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token tidak ditemukan' });

  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil data terbaru dari DB (termasuk coins)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, coins, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !profile)
      return res.status(404).json({ error: 'Profil tidak ditemukan' });

    return res.status(200).json(profile);

  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token tidak valid atau expired' });

    console.error('[User]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
