// api/webhook.js — Pakasir kirim POST ini saat pembayaran berhasil
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { order_id, status, amount, project, payment_method, completed_at } = req.body;

  if (!order_id || !status || !amount) {
    console.error('[Webhook] Missing fields:', req.body);
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (project && project !== process.env.PAKASIR_SLUG) {
    console.warn('[Webhook] Project mismatch:', project);
    return res.status(400).json({ error: 'Project mismatch' });
  }

  try {
    // 1. Ambil transaksi dari DB
    const { data: trx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (fetchError || !trx)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    // 2. Verifikasi amount (wajib per docs Pakasir)
    if (Number(trx.amount) !== Number(amount)) {
      console.error(`[Webhook] Amount mismatch! DB:${trx.amount} vs Webhook:${amount}`);
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // 3. Idempotency
    if (trx.status === 'completed')
      return res.status(200).json({ message: 'Already completed' });

    // 4. Double-check via Pakasir Transaction Detail API (rekomendasi docs)
    const checkUrl = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${process.env.PAKASIR_API_KEY}`;
    const pakasirRes = await fetch(checkUrl);
    const pakasirData = await pakasirRes.json();

    if (!pakasirRes.ok || !pakasirData.transaction || pakasirData.transaction.status !== 'completed') {
      console.warn('[Webhook] Pakasir verify gagal:', pakasirData);
      return res.status(400).json({ error: 'Verifikasi Pakasir gagal' });
    }

    // 5. Update transaksi
    await supabase
      .from('transactions')
      .update({
        status: 'completed',
        payment_method: payment_method || pakasirData.transaction.payment_method || null,
        completed_at: completed_at || pakasirData.transaction.completed_at || new Date().toISOString()
      })
      .eq('order_id', order_id);

    // 6. Tambah coins ke user (atomic via RPC function)
    if (trx.user_id) {
      const { data: newCoins, error: coinsErr } = await supabase.rpc('add_coins', {
        p_user_id: trx.user_id,
        p_amount: Number(amount)
      });

      if (coinsErr) {
        console.error('[Webhook] Gagal tambah coins:', coinsErr);
        // Tetap return 200 agar Pakasir tidak retry — perlu manual fix
      } else {
        console.log(`[Webhook] +${amount} coins → user ${trx.user_id}, total: ${newCoins}`);
      }
    }

    console.log(`[Webhook] OK — ${order_id} completed Rp${amount}`);
    return res.status(200).json({ message: 'OK' });

  } catch (err) {
    console.error('[Webhook] Exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
