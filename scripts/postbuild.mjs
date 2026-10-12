import {readFile,writeFile,readdir,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
// Ship the actual application source, pinned lockfile, rules, licences and tests.
execFileSync('python3',['scripts/package-source.py']);
await copyFile('LICENSE','dist/LICENSE');await copyFile('NOTICE.md','dist/NOTICE.md');
await mkdir('dist/validation',{recursive:true});
await copyFile('tests/fixtures/numerical-summary.json','dist/validation/numerical-summary.json');
async function files(root,prefix=''){const out=[];for(const entry of await readdir(root,{withFileTypes:true})){const path=`${prefix}/${entry.name}`;if(entry.isDirectory())out.push(...await files(`${root}/${entry.name}`,path));else if(!['source.tar.xz','sw.js'].includes(entry.name))out.push(path);}return out;}
const assets=(await files('dist')).filter(p=>!p.startsWith('/locations/names/')&&!p.startsWith('/locations/pins/')).sort();const hash=createHash('sha256');for(const file of assets)hash.update(await readFile(`dist${file}`));const cache=`jyotir-${hash.digest('hex').slice(0,16)}`;
const sw=`const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jyotir-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}if(url.pathname.startsWith('/locations/names/')||url.pathname.startsWith('/locations/pins/')){event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok){try{await cache.put(event.request,response.clone());const keys=(await cache.keys()).filter(r=>new URL(r.url).pathname.startsWith('/locations/names/')||new URL(r.url).pathname.startsWith('/locations/pins/'));for(const old of keys.slice(0,Math.max(0,keys.length-128)))await cache.delete(old);}catch{}}return response;}));return;}if(FILES.includes(url.pathname))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});\n`;
await writeFile('dist/sw.js',sw);console.log(`Offline precache: ${assets.length} assets, ${cache}. Source archive shipped.`);
