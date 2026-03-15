// api/transactions.js — riwayat transaksi user
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

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, order_id, amount, status, type, payment_method, created_at, completed_at')
      .eq('user_id', decoded.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(data || []);

  } catch (err) {
    console.error('[Transactions]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
