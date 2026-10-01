import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// app/api/contact/route.ts has no imports: transpile it here, like lib/curtain.test.mjs.
const { outputText } = ts.transpileModule(readFileSync('app/api/contact/route.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { POST } = await import(`data:text/javascript,${encodeURIComponent(outputText)}`);

const post = (fields) => {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  return POST(new Request('https://arohance.com/api/contact', {
    method: 'POST', body, headers: { referer: 'https://arohance.com/contact' },
  }));
};

test('a valid enquiry is emailed to info@arohance.com, replying to the sender', async () => {
  let sent;
  globalThis.fetch = async (url, init) => { sent = { url, body: JSON.parse(init.body) }; return new Response('{}'); };
  const res = await post({ name: 'Asha\nRao', email: 'asha@acme.in', brief: 'A new site' });
  assert.equal(res.status, 200);
  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.deepEqual(sent.body.to, ['info@arohance.com']);
  assert.equal(sent.body.reply_to, 'asha@acme.in');
  assert.equal(sent.body.subject, 'Website (/contact): Asha Rao');
  assert.match(sent.body.text, /brief: A new site/);
});

test('missing name or bad email is rejected without sending', async () => {
  globalThis.fetch = async () => assert.fail('must not send');
  assert.equal((await post({ name: '', email: 'asha@acme.in' })).status, 400);
  assert.equal((await post({ name: 'Asha', email: 'not-an-email' })).status, 400);
});

test('a Resend failure surfaces as 502, so the form shows its error', async () => {
  globalThis.fetch = async () => new Response('nope', { status: 401 });
  const err = console.error;
  console.error = () => {};
  try {
    assert.equal((await post({ name: 'Asha', email: 'asha@acme.in' })).status, 502);
  } finally {
    console.error = err;
  }
});
