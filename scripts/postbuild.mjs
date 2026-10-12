import {readFile,writeFile,readdir,copyFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
// Ship the actual application source, pinned lockfile, rules, licences and tests.
execFileSync('python3',['scripts/package-source.py']);
await mkdir('dist/client',{recursive:true});
for(const entry of await readdir('dist',{withFileTypes:true}))if(!['client','server'].includes(entry.name))await rename(`dist/${entry.name}`,`dist/client/${entry.name}`);
await rename('dist/server/worker.js','dist/server/index.js');
await copyFile('LICENSE','dist/client/LICENSE');await copyFile('NOTICE.md','dist/client/NOTICE.md');
await mkdir('dist/client/validation',{recursive:true});
await copyFile('tests/fixtures/numerical-summary.json','dist/client/validation/numerical-summary.json');
async function files(root,prefix=''){const out=[];for(const entry of await readdir(root,{withFileTypes:true})){const path=`${prefix}/${entry.name}`;if(entry.isDirectory())out.push(...await files(`${root}/${entry.name}`,path));else if(!['source.tar.xz','sw.js'].includes(entry.name))out.push(path);}return out;}
const assets=(await files('dist/client')).filter(p=>!p.startsWith('/locations/names/')&&!p.startsWith('/locations/pins/')).sort();const hash=createHash('sha256');for(const file of assets)hash.update(await readFile(`dist/client${file}`));const cache=`jyotir-${hash.digest('hex').slice(0,16)}`;
const sw=`const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jyotir-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}if(url.pathname.startsWith('/locations/names/')||url.pathname.startsWith('/locations/pins/')){event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok){try{await cache.put(event.request,response.clone());const keys=(await cache.keys()).filter(r=>new URL(r.url).pathname.startsWith('/locations/names/')||new URL(r.url).pathname.startsWith('/locations/pins/'));for(const old of keys.slice(0,Math.max(0,keys.length-128)))await cache.delete(old);}catch{}}return response;}));return;}if(FILES.includes(url.pathname))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});\n`;
await writeFile('dist/client/sw.js',sw);console.log(`Offline precache: ${assets.length} assets, ${cache}. Source archive shipped.`);

// A small API Worker alongside the unchanged Vite/PWA assets. Sites injects DB.
await mkdir('dist/.openai',{recursive:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'astra-kundali',main:'index.js',compatibility_date:'2026-10-12',assets:{directory:'../client',binding:'ASSETS',not_found_handling:'single-page-application',run_worker_first:['/api/*']},d1_databases:[{binding:'DB',database_name:'astra-views',database_id:'00000000-0000-4000-8000-000000000000'}]},null,2)+'\n');
