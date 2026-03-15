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

    // Jika sudah completed di DB → coins sudah ditambah sebelumnya, langsung return
    if (trx.status === 'completed')
      return res.status(200).json({ status: 'completed', amount: trx.amount });

    // Cek ke Pakasir API
    const pakasirUrl = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_SLUG}&amount=${trx.amount}&order_id=${order_id}&api_key=${process.env.PAKASIR_API_KEY}`;
    const pakasirRes = await fetch(pakasirUrl);
    const pakasirData = await pakasirRes.json();

    if (!pakasirRes.ok || !pakasirData.transaction)
      return res.status(200).json({ status: trx.status });

    const pakasirStatus = pakasirData.transaction.status;

    // Jika completed → update DB dulu, baru tambah coins
    if (pakasirStatus === 'completed') {
      // 1. Update status transaksi
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          payment_method: pakasirData.transaction.payment_method || null,
          completed_at: pakasirData.transaction.completed_at || new Date().toISOString()
        })
        .eq('order_id', order_id);

      // 2. Tambah coins ke user (atomic via RPC)
      if (trx.user_id) {
        const { data: newCoins, error: coinsErr } = await supabase.rpc('add_coins', {
          p_user_id: trx.user_id,
          p_amount: trx.amount
        });

        if (coinsErr) {
          console.error('[CheckStatus] Gagal tambah coins:', coinsErr);
        } else {
          console.log(`[CheckStatus] +${trx.amount} coins → user ${trx.user_id}, total: ${newCoins}`);
        }
      }

      return res.status(200).json({ status: 'completed', amount: trx.amount });
    }

    // Status lain (pending, cancelled) — update saja tanpa tambah coins
    if (pakasirStatus !== trx.status) {
      await supabase
        .from('transactions')
        .update({ status: pakasirStatus })
        .eq('order_id', order_id);
    }

    return res.status(200).json({ status: pakasirStatus, amount: trx.amount });

  } catch (err) {
    console.error('[CheckStatus]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
