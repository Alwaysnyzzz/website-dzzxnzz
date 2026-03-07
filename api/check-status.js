const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { order_id, amount } = req.query;
  if (!order_id || !amount) {
    return res.status(400).json({ error: 'order_id dan amount diperlukan' });
  }

  try {
    const url = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${process.env.PAKASIR_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.transaction) {
      // Update status di database
      await supabase
        .from('transactions')
        .update({ status: data.transaction.status })
        .eq('order_id', order_id);

      return res.status(200).json(data.transaction);
    } else {
      return res.status(500).json({ error: 'Gagal cek status' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}