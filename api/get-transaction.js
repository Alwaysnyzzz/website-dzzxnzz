const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { order_id } = req.query;
  if (!order_id) {
    return res.status(400).json({ error: 'order_id required' });
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('order_id', order_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
  }

  res.status(200).json(data);
}