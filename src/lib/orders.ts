import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type OrderStatus = 'pending' | 'awaiting_review' | 'paid' | 'cancelled';

export type OrderLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  flavor?: string;
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  comment: string;
  carrier: string;
  delivery_option: string;
  items: OrderLine[];
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  cancel_reason: string | null;
  locale: string;
  created_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
};

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseReady = () => Boolean(URL && SERVICE_KEY);

let client: SupabaseClient | null = null;

/**
 * Service-role client, server-only. Orders carry names and phone numbers, so
 * the table stays closed to the anon key and is only ever reached from here.
 */
function db(): SupabaseClient {
  if (!URL || !SERVICE_KEY) throw new Error('supabase_not_configured');
  client ??= createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });
  return client;
}

export async function createOrder(
  input: Omit<Order, 'id' | 'order_number' | 'created_at' | 'paid_at' | 'confirmed_at' | 'cancel_reason'>,
): Promise<Order> {
  const { data, error } = await db().from('orders').insert(input).select().single();
  if (error) throw new Error(`supabase_insert: ${error.message}`);
  return data as Order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await db().from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`supabase_select: ${error.message}`);
  return (data as Order) ?? null;
}

/**
 * Only ever moves an order forward, and only from the state the caller expects.
 * Without the `from` guard a replayed Telegram callback could revive a
 * cancelled order, or confirm one twice.
 */
export async function setStatus(
  id: string,
  status: OrderStatus,
  opts: { from?: OrderStatus[]; reason?: string } = {},
): Promise<Order | null> {
  const patch: Record<string, unknown> = { status };
  if (opts.reason) patch.cancel_reason = opts.reason;
  if (status === 'awaiting_review') patch.paid_at = new Date().toISOString();
  if (status === 'paid' || status === 'cancelled') patch.confirmed_at = new Date().toISOString();

  let q = db().from('orders').update(patch).eq('id', id);
  if (opts.from?.length) q = q.in('status', opts.from);

  const { data, error } = await q.select().maybeSingle();
  if (error) throw new Error(`supabase_update: ${error.message}`);
  return (data as Order) ?? null;
}

/** Newest orders in one status — what the bot's list screens show. */
export async function listOrders(status: OrderStatus, limit = 10): Promise<Order[]> {
  const { data, error } = await db()
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`supabase_list: ${error.message}`);
  return (data ?? []) as Order[];
}

export type DayStats = {
  total: number;
  paid: number;
  cancelled: number;
  pending: number;
  revenue: number;
};

/**
 * Counted from midnight in Almaty, not UTC — a shop in Kazakhstan reading
 * "today" wants its own day, and UTC would roll over at 6am local.
 */
export async function todayStats(): Promise<DayStats> {
  const now = new Date();
  const almaty = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Almaty' }));
  almaty.setHours(0, 0, 0, 0);
  const since = new Date(now.getTime() - (Date.now() - almaty.getTime())).toISOString();

  const { data, error } = await db()
    .from('orders')
    .select('status,total_amount')
    .gte('created_at', since);
  if (error) throw new Error(`supabase_stats: ${error.message}`);

  const rows = (data ?? []) as { status: OrderStatus; total_amount: number }[];
  return {
    total: rows.length,
    paid: rows.filter((r) => r.status === 'paid').length,
    cancelled: rows.filter((r) => r.status === 'cancelled').length,
    pending: rows.filter((r) => r.status === 'pending' || r.status === 'awaiting_review').length,
    revenue: rows.filter((r) => r.status === 'paid').reduce((s, r) => s + r.total_amount, 0),
  };
}
