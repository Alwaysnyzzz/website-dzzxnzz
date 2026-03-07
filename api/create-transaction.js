import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount } = req.body;
  if (!amount || amount < 1000) {
    return res.status(400).json({ error: 'Minimal donasi Rp 1.000' });
  }

  // Generate order_id unik
  const order_id = 'DONASI-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  // Simpan ke Supabase (status pending)
  const { error } = await supabase.from('transactions').insert([
    { order_id, amount, status: 'pending' }
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal menyimpan transaksi' });
  }

  // Buat URL pembayaran Pakasir (via URL method)
  const payment_url = `https://app.pakasir.com/pay/${process.env.PAKASIR_SLUG}/${amount}?order_id=${order_id}&qris_only=1&redirect=${process.env.BASE_URL}/success?order_id=${order_id}`;

  res.status(200).json({ payment_url, order_id });
}