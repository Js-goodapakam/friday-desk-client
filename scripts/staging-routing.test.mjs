import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { stagingRouting } from './staging-routing.mjs';

test('routes staging API calls through the frontend origin before the SPA fallback', async () => {
  const config = stagingRouting('https://engage-stay-staging.vercel.app');
  assert.deepEqual(config.rewrites[0],{source:'/api/:path*',destination:'https://engage-stay-staging.vercel.app/api/:path*'});
  assert.equal(config.rewrites[1].destination,'/index.html');
  const production = JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.equal(production.rewrites[0].destination,'https://friday-ai-desk-server.vercel.app/api/:path*');
});

test('rejects absent configuration, production and preview targets, and malformed origins', () => {
  for (const candidate of [undefined,'https://friday-ai-desk-server.vercel.app','https://app-engagestay-server.vercel.app',
    'https://engage-stay-staging-other.vercel.app','http://engage-stay-staging.vercel.app',
    'https://engage-stay-staging.vercel.app/api','https://user@engage-stay-staging.vercel.app','https://engage-stay-staging.vercel.app?x=1']) {
    assert.throws(()=>stagingRouting(candidate));
  }
});
