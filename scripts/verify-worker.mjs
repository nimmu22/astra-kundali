import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const source=await readFile('dist/server/index.js','utf8');
const {default:worker}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal(typeof worker.fetch,'function');
const config=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
assert.equal(config.assets.binding,'ASSETS');assert.deepEqual(config.assets.run_worker_first,['/api/*']);assert.equal(config.d1_databases[0].binding,'DB');
await access(resolve('dist/server',config.assets.directory,'index.html'));
const hosting=JSON.parse(await readFile('dist/.openai/hosting.json','utf8'));assert.equal(hosting.d1,'DB');assert.ok(!('static' in hosting));
const failed=await worker.fetch(new Request('https://example.com/api/views'),{});assert.equal(failed.status,503);
let assetPassed=false;const page=await worker.fetch(new Request('https://example.com/'),{ASSETS:{async fetch(){assetPassed=true;return new Response('index');}}});assert.equal(await page.text(),'index');assert.ok(assetPassed);
console.log('Worker ESM, DB/ASSETS declarations, client index, API failure and asset delegation passed.');

// Server uploads contain executable modules only, not a second copy of public data.
assert.deepEqual((await readdir('dist/server')).sort(),['index.js','wrangler.json']);
console.log('Server bundle excludes duplicated public location assets.');
