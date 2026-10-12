import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Chart} from '../src/components/Chart';
import type {ChartResult} from '../src/domain';
const {default:App}=await import('../test-output/ssr/App.js' as string);
const en=renderToStaticMarkup(createElement(App));assert.ok(en.includes('Generate my Kundali')&&en.includes('No account needed')&&!en.includes('NaN'));
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string)=>key==='jyotir-lang'?'hi':'light'},configurable:true});
const hi=renderToStaticMarkup(createElement(App));assert.ok(hi.includes('मेरी कुण्डली बनाएँ')&&hi.includes('जन्म तिथि'));
await mkdir('test-output/charts',{recursive:true});const c=JSON.parse(await readFile('tests/fixtures/numerical-cases.json','utf8')).charts[125] as ChartResult;
const css='.chart-bg{fill:#202824}.chart-line{stroke:#d9ba84;stroke-width:.75;opacity:.7}.sign-label{fill:#99a59d;font:9px sans-serif}.chart-planet{fill:#c5dbac;font:12px sans-serif}.chart-center{fill:#d9ba84;font:31px serif}';
for(const style of ['north','south','east'] as const){const svg=renderToStaticMarkup(createElement(Chart,{chart:c,division:1,style,lang:'en'})).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('<defs>',`<style>${css}</style><defs>`);assert.equal((svg.match(/class="chart-planet/g)||[]).length,9);await writeFile(`test-output/charts/${style}.svg`,svg);}
// Examine the production service worker's actual URL inventory without a browser.
const sw=await readFile('dist/sw.js','utf8');const inventory=JSON.parse(sw.match(/FILES=(\[[^;]+\])/s)![1]) as string[];
assert.ok(inventory.some(p=>p.endsWith('.wasm'))&&inventory.some(p=>p.includes('worker-'))&&inventory.includes('/data/world.json')&&inventory.some(p=>p.includes('devanagari')&&p.endsWith('.woff2')));
for(const asset of inventory)await readFile(`dist${asset}`);
assert.ok(!inventory.includes('/source.tar.xz'));assert.ok(inventory.includes('/locations/manifest.json')&&!inventory.some(p=>p.startsWith('/locations/names/')||p.startsWith('/locations/pins/')));console.log('SSR English/Hindi, 3 SVG layouts and offline asset inventory passed. Browser interaction/offline tests are still required.');
