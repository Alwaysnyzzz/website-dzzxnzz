import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { order_id, status, amount } = req.body;

  // Validasi sederhana: bisa tambah verifikasi signature nanti
  if (!order_id || !status) {
    return res.status(400).send('Missing fields');
  }

  // Update status di Supabase
  const { error } = await supabase
    .from('transactions')
    .update({ status })
    .eq('order_id', order_id);

  if (error) {
    console.error(error);
    return res.status(500).send('DB Error');
  }

  res.status(200).send('OK');
}