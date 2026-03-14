// api/get-transaction.js
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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });

    return res.status(200).json(data);

  } catch (err) {
    console.error('[GetTrx]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
