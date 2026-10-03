import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type SaleRecord = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  customerName: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
  notes: string;
  createdAt: string;
  appliedInventory?: boolean;
};

const STORAGE_KEY = 'uphar_sales';

const mapFromDb = (row: Record<string, unknown>): SaleRecord => ({
  id: row.id as string,
  productId: row.product_id as string,
  productName: row.product_name as string,
  quantity: Number(row.quantity),
  amount: Number(row.amount),
  paymentMethod: row.payment_method as string,
  customerName: (row.customer_name as string) || 'Walk-in customer',
  status: String(row.status).replace(/^./, (letter) => letter.toUpperCase()) as SaleRecord['status'],
  notes: (row.notes as string) || '',
  createdAt: row.sold_at as string,
  appliedInventory: Boolean(row.inventory_applied),
});

export const fetchSales = async (): Promise<SaleRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('sales').select('*').order('sold_at', { ascending: false });
    if (!error && data) return data.map(mapFromDb);
    if (error) console.error('Error fetching sales:', error);
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SaleRecord[];
  } catch (error) {
    console.error('Unable to parse saved sales:', error);
    return [];
  }
};

export const saveSales = async (records: SaleRecord[]): Promise<SaleRecord[]> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  if (!(isSupabaseConfigured() && supabase)) return records;

  const { error: deleteError } = await supabase.from('sales').delete().neq('id', '');
  if (deleteError) {
    console.error('Error replacing sales:', deleteError);
    return records;
  }

  const { data, error } = await supabase.from('sales').insert(records.map((sale) => ({
    product_id: sale.productId,
    product_name: sale.productName,
    quantity: sale.quantity,
    amount: sale.amount,
    payment_method: sale.paymentMethod.toLowerCase(),
    customer_name: sale.customerName,
    status: sale.status.toLowerCase(),
    notes: sale.notes || null,
    inventory_applied: sale.appliedInventory ?? false,
    sold_at: sale.createdAt,
  }))).select('*');
  if (error) {
    console.error('Error saving sales:', error);
    return records;
  }
  return (data || []).map(mapFromDb);
};
