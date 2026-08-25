import type { Order } from './orders';

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? 'info@loopenergy.kz';

export const emailReady = () => Boolean(KEY);

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const money = (v: number) => `${new Intl.NumberFormat('ru-RU').format(v)} ₸`;

function body(order: Order, forCustomer: boolean) {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;color:#e7e2ee">${esc(i.name)}${i.flavor ? ` · ${esc(i.flavor)}` : ''} × ${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#fff;white-space:nowrap">${money(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join('');

  const heading = forCustomer
    ? `Спасибо за заказ! Мы свяжемся с вами для подтверждения доставки.`
    : `Новый заказ с сайта.`;

  return `<div style="background:#201b24;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:28px;border-radius:16px;max-width:600px;margin:0 auto">
    <h1 style="margin:0 0 4px;font-size:20px;color:#b78dff">LOOP Energy</h1>
    <p style="margin:0 0 20px;color:#bdb5c9;font-size:14px">${heading}</p>
    <p style="margin:0 0 16px;font-size:16px"><strong>Заказ №${order.order_number}</strong></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <hr style="border:0;border-top:1px solid rgba(149,97,233,.35);margin:16px 0"/>
    <p style="margin:0;font-size:18px;color:#b78dff"><strong>Итого: ${money(order.total_amount)}</strong></p>
    <p style="margin:16px 0 0;font-size:13px;color:#bdb5c9">
      Получатель: ${esc(order.customer_name)}, ${esc(order.customer_phone)}<br/>
      Город: ${esc(order.city || '—')}${order.address ? `<br/>Адрес: ${esc(order.address)}` : ''}<br/>
      Доставка: ${esc(order.carrier)} · ${esc(order.delivery_option || '—')}<br/>
      Оплата: ${order.payment_method === 'kaspi' ? 'Kaspi QR' : 'Картой онлайн'}
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#79707f">loopenergy.kz</p>
  </div>`;
}

/**
 * Confirmation to the customer when they left an address, and a copy to the
 * shop either way. Never throws: a mail provider having a bad day must not
 * take an order down with it.
 */
export async function sendOrderEmails(order: Order, customerEmail?: string) {
  if (!KEY) return { sent: 0, error: 'no_api_key' as const };

  const { Resend } = await import('resend');
  const resend = new Resend(KEY);
  let sent = 0;
  let error: string | undefined;

  // Until the sending domain is verified every send is refused for the same
  // reason. Noticing it once stops a second doomed request per order, and keeps
  // a setup step out of the error log where it reads like a fault.
  let domainUnverified = false;

  const send = async (to: string, subject: string, html: string) => {
    if (domainUnverified) return;
    try {
      const res = await resend.emails.send({ from: `LOOP Energy <${FROM}>`, to: [to], subject, html });
      if (res.error) {
        error = res.error.message;
        if (/not verified/i.test(res.error.message)) {
          domainUnverified = true;
          console.warn('[email] skipped — sending domain is not verified in Resend yet');
          return;
        }
        console.error('[email]', to, res.error.message);
        return;
      }
      sent += 1;
    } catch (e) {
      error = String(e);
      console.error('[email]', to, e);
    }
  };

  if (customerEmail) {
    await send(customerEmail, `Заказ №${order.order_number} принят — LOOP Energy`, body(order, true));
  }
  await send(FROM, `Новый заказ №${order.order_number} — ${order.customer_name}`, body(order, false));

  return { sent, error };
}
