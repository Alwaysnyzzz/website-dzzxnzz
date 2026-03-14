// api/create-transaction.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, user_id } = req.body;

  if (!amount || Number(amount) < 500) {
    return res.status(400).json({ error: 'Minimal isi saldo Rp 500' });
  }

  const order_id = 'SALDO-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

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
    console.log('[CreateTrx] Pakasir response:', pakasirData);

    if (!pakasirRes.ok) {
      return res.status(500).json({ error: pakasirData.message || 'Gagal dari Pakasir' });
    }

    // Simpan ke Supabase — sertakan type & user_id untuk webhook
    const { error: dbError } = await supabase.from('transactions').insert([{
      order_id,
      amount: Number(amount),
      status: 'pending',
      type: 'isisaldo',
      user_id: user_id || null,
      qr_string: pakasirData.payment?.payment_number || null,
      expired_at: pakasirData.payment?.expired_at || null
    }]);

    if (dbError) {
      console.error('[CreateTrx] Supabase error:', dbError);
      return res.status(500).json({ error: 'Gagal menyimpan transaksi: ' + dbError.message });
    }

    return res.status(200).json({ order_id });

  } catch (err) {
    console.error('[CreateTrx] Exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
