const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id, amount } = req.body;
  if (!order_id || !amount) {
    return res.status(400).json({ error: 'order_id dan amount diperlukan' });
  }

  try {
    const cancelUrl = 'https://app.pakasir.com/api/transactioncancel';
    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: process.env.PAKASIR_SLUG,
        order_id,
        amount,
        api_key: process.env.PAKASIR_API_KEY
      })
    });

    const data = await response.json();

    if (response.ok) {
      await supabase
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('order_id', order_id);
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}