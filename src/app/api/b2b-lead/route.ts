import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type LeadPayload = {
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  city?: unknown;
  comment?: unknown;
  locale?: unknown;
};

const asTrimmedString = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** Kazakh numbers normalise to 11 digits starting with 7 (+7 / 8 prefixes). */
const normalisePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  return digits;
};

export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = asTrimmedString(body.name, 120);
  const company = asTrimmedString(body.company, 160);
  const phone = normalisePhone(asTrimmedString(body.phone, 40));
  const city = asTrimmedString(body.city, 80);
  const comment = asTrimmedString(body.comment, 2000);
  const locale = asTrimmedString(body.locale, 8) || 'ru';

  if (!name || !phone || !city) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  if (!/^7\d{10}$/.test(phone)) {
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 422 });
  }

  // No CRM is wired up yet — the lead is logged so it shows in Vercel's
  // function logs until an integration replaces this.
  console.info('[b2b-lead]', {
    receivedAt: new Date().toISOString(),
    name,
    company,
    phone: `+${phone}`,
    city,
    comment,
    locale,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
