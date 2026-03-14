// api/webhook.js
// Webhook dari Pakasir - dipanggil otomatis saat pembayaran berhasil
// Docs: POST body = { amount, order_id, project, status, payment_method, completed_at }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { order_id, status, amount, project, payment_method, completed_at } = req.body;

  // Validasi field wajib
  if (!order_id || !status || !amount) {
    console.error('[Webhook] Missing fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verifikasi project slug
  if (project && project !== process.env.PAKASIR_SLUG) {
    console.warn('[Webhook] Project mismatch:', project);
    return res.status(400).json({ error: 'Project mismatch' });
  }

  try {
    // 1. Ambil transaksi dari DB untuk verifikasi amount + order_id
    //    (sesuai rekomendasi docs Pakasir: selalu verifikasi ulang via API)
    const { data: trx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (fetchError || !trx) {
      console.error('[Webhook] Transaksi tidak ditemukan:', order_id);
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // 2. Verifikasi amount (WAJIB sesuai docs Pakasir)
    if (Number(trx.amount) !== Number(amount)) {
      console.error(`[Webhook] Amount mismatch! DB: ${trx.amount}, Webhook: ${amount}`);
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // 3. Idempotency — jika sudah completed, skip
    if (trx.status === 'completed') {
      console.log('[Webhook] Sudah completed sebelumnya, skip:', order_id);
      return res.status(200).json({ message: 'Already completed' });
    }

    // 4. Double-check via Transaction Detail API Pakasir (lebih valid per docs)
    const checkUrl = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${process.env.PAKASIR_API_KEY}`;
    const pakasirCheck = await fetch(checkUrl);
    const pakasirData = await pakasirCheck.json();

    if (!pakasirCheck.ok || !pakasirData.transaction || pakasirData.transaction.status !== 'completed') {
      console.warn('[Webhook] Pakasir API check gagal atau status bukan completed:', pakasirData);
      return res.status(400).json({ error: 'Verifikasi Pakasir gagal' });
    }

    // 5. Update status transaksi
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        payment_method: payment_method || pakasirData.transaction.payment_method || null,
        completed_at: completed_at || pakasirData.transaction.completed_at || new Date().toISOString()
      })
      .eq('order_id', order_id);

    if (updateError) {
      console.error('[Webhook] Gagal update transaksi:', updateError);
      return res.status(500).json({ error: 'DB Error update transaksi' });
    }

    // 6. Jika tipe = isisaldo → tambah coins ke user
    if (trx.type === 'isisaldo' && trx.user_id) {
      const { data: userRow, error: userErr } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', trx.user_id)
        .single();

      if (!userErr && userRow) {
        const newCoins = (Number(userRow.coins) || 0) + Number(amount);
        const { error: coinsErr } = await supabase
          .from('profiles')
          .update({ coins: newCoins })
          .eq('id', trx.user_id);

        if (coinsErr) {
          console.error('[Webhook] Gagal update coins user:', coinsErr);
          // Return 200 tetap agar Pakasir tidak retry — catat untuk manual fix
        } else {
          console.log(`[Webhook] +${amount} coins → user ${trx.user_id}, total: ${newCoins}`);
        }
      }
    }

    console.log(`[Webhook] Sukses — order_id: ${order_id}, status: completed, amount: ${amount}`);
    return res.status(200).json({ message: 'OK' });

  } catch (err) {
    console.error('[Webhook] Exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
