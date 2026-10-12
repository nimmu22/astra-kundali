import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import worker,{type CounterDatabase} from '../src/server/worker';
import {ViewCounter} from '../src/components/ViewCounter';
import {pageViewRegistration} from '../src/view-counter';
const url='https://example.com/api/views';
function request(method='GET',headers:Record<string,string>={}){return new Request(url,{method,headers:{...method==='POST'?{'X-Astra-View':'1',Origin:'https://example.com'}:{},...headers}});}
async function database(){
 const db=new DatabaseSync(':memory:');
 const journal=JSON.parse(await readFile('drizzle/meta/_journal.json','utf8'));
 for(const migration of journal.entries)db.exec(await readFile(`drizzle/${migration.tag}.sql`,'utf8'));
 const DB:CounterDatabase={prepare(sql){return {async first<T>(){return (db.prepare(sql).get()??null) as T|null;}};}};
 return {db,DB};
}
test('Counter uses a real schema, atomic increments, persistent shared totals and read-only polling',async()=>{
 const {db,DB}=await database();try{
  assert.deepEqual(await (await worker.fetch(request(),{DB})).json(),{views:0});
  const results=await Promise.all(Array.from({length:30},()=>worker.fetch(request('POST'),{DB}).then(r=>r.json() as Promise<{views:number}>)));
  assert.deepEqual(results.map(r=>r.views).sort((a,b)=>a-b),Array.from({length:30},(_,i)=>i+1));
  const fresh=(await import('../src/server/worker')).default;
  const read=await fresh.fetch(request(),{DB});assert.equal(read.headers.get('Cache-Control'),'no-store, max-age=0');assert.deepEqual(await read.json(),{views:30});
  assert.deepEqual(await (await worker.fetch(request(),{DB})).json(),{views:30});
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM site_views').get()!.n,1);
 }finally{db.close();}
});
test('Counter rejects cross-site writes and unsupported methods; failures never invent a zero count',async()=>{
 const {db,DB}=await database();try{
  assert.equal((await worker.fetch(request('POST',{Origin:'https://elsewhere.com'}),{DB})).status,403);
  assert.equal((await worker.fetch(request('POST',{'Sec-Fetch-Site':'cross-site'}),{DB})).status,403);
  assert.equal((await worker.fetch(request('POST',{'X-Astra-View':''}),{DB})).status,400);
  assert.equal((await worker.fetch(request('DELETE'),{DB})).status,405);
  assert.deepEqual(await (await worker.fetch(request(),{DB})).json(),{views:0});
  const absent=await worker.fetch(request(),{});assert.equal(absent.status,503);assert.ok(!('views' in (await absent.json() as object)));
  const broken=await worker.fetch(request(),{DB:{prepare(){throw Error('database failure');}}});assert.equal(broken.status,503);assert.ok(!('views' in (await broken.json() as object)));
  for(const invalid of [-1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.equal((await worker.fetch(request(),{DB:{prepare(){return {async first<T>(){return {total:invalid} as T;}};}}})).status,503);
 }finally{db.close();}
});
test('Worker delegates non-API assets, keeps unknown API paths as 404, and renders honest bilingual header placeholders',async()=>{
 const asset=new Request('https://example.com/assets/test.wasm');let actual:Request|null=null;
 const response=await worker.fetch(asset,{ASSETS:{async fetch(r){actual=r;return new Response('wasm',{headers:{'Content-Type':'application/wasm'}});}}});assert.equal(actual,asset);assert.equal(response.headers.get('Content-Type'),'application/wasm');
 assert.equal((await worker.fetch(new Request('https://example.com/api/missing'),{})).status,404);
 for(const lang of ['en','hi'] as const){const html=renderToStaticMarkup(createElement(ViewCounter,{lang}));assert.ok(html.includes(lang==='hi'?'पेज व्यूज़':'Page views'));assert.ok(html.includes('—'));assert.ok(!html.includes('>0<'));}
});

test('One document registers once across remounts; refresh registers a new view and failed writes only read',async()=>{
 const calls:boolean[]=[];const request=async(write:boolean)=>{calls.push(write);return calls.length;};
 const document=pageViewRegistration(request);
 assert.deepEqual(await Promise.all([document(),document(),document()]),[1,1,1]);assert.deepEqual(calls,[true]);
 const refresh=pageViewRegistration(request);assert.equal(await refresh(),2);assert.deepEqual(calls,[true,true]);
 const fallback:boolean[]=[];const failed=pageViewRegistration(async(write)=>{fallback.push(write);if(write)throw Error('response lost');return 12;});
 assert.deepEqual(await Promise.all([failed(),failed()]),[12,12]);assert.deepEqual(fallback,[true,false]);
});
