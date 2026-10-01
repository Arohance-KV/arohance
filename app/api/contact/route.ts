// Every `[data-ag-form]` (lib/behaviors/form.ts) posts here. The fields go
// out as one plain-text email to info@arohance.com through Resend's REST API
// (one fetch, no SDK). Needs RESEND_API_KEY set, and arohance.com verified
// as a sending domain in Resend, or Resend rejects FROM.
const TO = 'info@arohance.com';
const FROM = 'Arohance Website <website@arohance.com>';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ponytail: no spam protection or rate limit; add a honeypot field or Cloudflare Turnstile if junk starts arriving.
export async function POST(req: Request) {
  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const fields = Object.fromEntries(
    [...data].slice(0, 20).map(([k, v]) => [k, String(v).trim().slice(0, 5000)]),
  );
  const name = (fields.name ?? '').replace(/\s+/g, ' ');
  const email = fields.email ?? '';
  if (!name || !EMAIL.test(email)) {
    return Response.json({ error: 'Name and a valid email are required' }, { status: 400 });
  }

  const page = new URL(req.headers.get('referer') ?? '/', 'https://arohance.com').pathname;
  const text = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n\n') + `\n\nSent from ${page}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject: `Website (${page}): ${name}`, text }),
  });
  if (!res.ok) {
    console.error('Resend send failed', res.status, await res.text());
    return Response.json({ error: 'Send failed' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
