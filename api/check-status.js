// api/check-status.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ error: 'order_id diperlukan' });

  try {
    // Ambil transaksi dari DB
    const { data: trx, error: dbError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (dbError || !trx)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    // Jika sudah completed di DB, langsung return
    if (trx.status === 'completed')
      return res.status(200).json({ status: 'completed', amount: trx.amount });

    // Cek ke Pakasir API
    const pakasirUrl = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_SLUG}&amount=${trx.amount}&order_id=${order_id}&api_key=${process.env.PAKASIR_API_KEY}`;
    const pakasirRes = await fetch(pakasirUrl);
    const pakasirData = await pakasirRes.json();

    if (!pakasirRes.ok || !pakasirData.transaction)
      return res.status(200).json({ status: trx.status });

    const pakasirStatus = pakasirData.transaction.status;

    // Update status di DB jika berubah
    if (pakasirStatus !== trx.status) {
      await supabase
        .from('transactions')
        .update({
          status: pakasirStatus,
          payment_method: pakasirData.transaction.payment_method || null,
          completed_at: pakasirData.transaction.completed_at || null
        })
        .eq('order_id', order_id);

      // Jika completed → tambah coins
      if (pakasirStatus === 'completed' && trx.user_id) {
        await supabase.rpc('add_coins', {
          p_user_id: trx.user_id,
          p_amount: trx.amount
        });
      }
    }

    return res.status(200).json({ status: pakasirStatus, amount: trx.amount });

  } catch (err) {
    console.error('[CheckStatus]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
