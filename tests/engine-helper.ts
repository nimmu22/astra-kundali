import {readFile} from 'node:fs/promises';
import {AstroEngine} from '../src/astro/engine';
const realFetch=globalThis.fetch;
globalThis.fetch=async(resource,options)=>String(resource).startsWith('file:')?new Response(await readFile(new URL(String(resource))),{headers:{'Content-Type':'application/wasm'}}):realFetch(resource,options);
export async function engine(){const e=new AstroEngine();await e.init();return e;}
