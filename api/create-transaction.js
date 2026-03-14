// api/create-transaction.js
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verifikasi JWT custom
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Login dulu sebelum isi saldo' });

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  const { amount } = req.body;
  if (!amount || Number(amount) < 500)
    return res.status(400).json({ error: 'Minimal isi saldo Rp 500' });

  const order_id = 'SALDO-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  try {
    // Buat transaksi QRIS di Pakasir
    const pakasirRes = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: process.env.PAKASIR_SLUG,
        order_id,
        amount: Number(amount),
        api_key: process.env.PAKASIR_API_KEY
      })
    });

    const pakasirData = await pakasirRes.json();
    if (!pakasirRes.ok)
      return res.status(500).json({ error: pakasirData.message || 'Gagal dari Pakasir' });

    // Simpan ke Supabase
    const { error: dbError } = await supabase.from('transactions').insert({
      order_id,
      user_id: decoded.id,
      amount: Number(amount),
      status: 'pending',
      type: 'isisaldo',
      qr_string: pakasirData.payment?.payment_number || null,
      expired_at: pakasirData.payment?.expired_at || null
    });

    if (dbError)
      return res.status(500).json({ error: 'Gagal simpan transaksi: ' + dbError.message });

    return res.status(200).json({ order_id });

  } catch (err) {
    console.error('[CreateTrx]', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
