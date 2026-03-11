const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // Set CORS headers (opsional)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount } = req.body;
  console.log('Received amount:', amount);

  if (!amount || amount < 500) {
    return res.status(400).json({ error: 'Minimal donasi Rp 500' });
  }

  const order_id = 'DONASI-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  try {
    // Panggil API Pakasir untuk buat transaksi QRIS
    const pakasirRes = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: process.env.PAKASIR_SLUG,
        order_id: order_id,
        amount: amount,
        api_key: process.env.PAKASIR_API_KEY
      })
    });

    const pakasirData = await pakasirRes.json();
    console.log('Pakasir response:', pakasirData);

    if (!pakasirRes.ok) {
      return res.status(500).json({ error: pakasirData.message || 'Gagal dari Pakasir' });
    }

    // Simpan ke Supabase
    const { error } = await supabase.from('transactions').insert([
      {
        order_id,
        amount,
        status: 'pending',
        qr_string: pakasirData.payment.payment_number,
        expired_at: pakasirData.payment.expired_at
      }
    ]);

    if (error) {
      console.error('Supabase error detail:', error);
      return res.status(500).json({ error: 'Gagal menyimpan transaksi: ' + error.message });
    }

    // Buat URL pembayaran Pakasir dengan redirect ke halaman sukses
    const baseUrl = process.env.BASE_URL || 'https://website-dzzxnzz.vercel.app';
    const payment_url = `https://app.pakasir.com/pay/${process.env.PAKASIR_SLUG}/${amount}?order_id=${order_id}&qris_only=1&redirect=${baseUrl}/success?order_id=${order_id}`;

    res.status(200).json({ 
      order_id,
      payment_url 
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}