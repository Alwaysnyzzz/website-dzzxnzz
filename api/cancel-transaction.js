// api/cancel-transaction.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'order_id diperlukan' });

  try {
    // Ambil transaksi
    const { data: trx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (fetchError || !trx)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    if (trx.status === 'completed')
      return res.status(400).json({ error: 'Transaksi sudah selesai, tidak bisa dibatalkan' });

    // Cancel di Pakasir
    const pakasirRes = await fetch('https://app.pakasir.com/api/transactioncancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: process.env.PAKASIR_SLUG,
        order_id,
        amount: trx.amount,
        api_key: process.env.PAKASIR_API_KEY
      })
    });

    // Update status di DB (bahkan jika Pakasir gagal, update lokal)
    await supabase
      .from('transactions')
      .update({ status: 'cancelled' })
      .eq('order_id', order_id);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[CancelTrx]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
