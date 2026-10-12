import type {Place} from './domain';
import {PLACES} from './data/places';
export interface LocationManifest{settlements:number;postalLocations:number;pincodes:number;nameKeys:string[];pinPrefixes:string[];states:string[];retrieved:string;coverage:string}
export const normalizePlace=(s:string)=>s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').trim().replace(/\s+/g,' ');
export const locationKey=(s:string)=>Array.from(normalizePlace(s)).slice(0,2).map(c=>c.codePointAt(0)!.toString(16)).join('-');
const cache=new Map<string,Promise<any>>();
async function resource(path:string){let p=cache.get(path);if(!p){p=fetch(path).then(r=>{if(!r.ok)throw new Error('Location pack unavailable. Connect once to load it, or enter coordinates manually.');return r.json();}).catch(e=>{cache.delete(path);throw e;});cache.set(path,p);if(cache.size>24)cache.delete(cache.keys().next().value!);}return p;}
export const locationManifest=()=>resource('/locations/manifest.json') as Promise<LocationManifest>;
export function gazetteerPlace(r:any[]):Place{return {id:r[0],name:r[1],region:r[2],district:r[3],latitude:r[4],longitude:r[5],timezone:r[6],aliases:r[7],country:'IN',source:'gazetteer',coordinateQuality:'settlement'};}
export function postalPlace(r:any[]):Place{return {id:r[0],name:r[1],region:r[2],district:r[3],latitude:r[4],longitude:r[5],pincode:r[6],timezone:'Asia/Kolkata',country:'IN',source:'postal',coordinateQuality:'estimated'};}
export async function searchLocations(query:string,mode:'india'|'world'='india',state=''):Promise<Place[]>{
 const q=normalizePlace(query);if(q.length<2)return [];
 if(mode==='world'){const rows:Place[]=await resource('/data/world.json');return rows.filter(p=>normalizePlace(`${p.name} ${p.region} ${p.country}`).includes(q)).sort((a,b)=>Number(normalizePlace(b.name)===q)-Number(normalizePlace(a.name)===q));}
 if(/^\d+$/.test(q)){if(!/^[1-9]\d{5}$/.test(q))return [];const m=await locationManifest();if(!m.pinPrefixes.includes(q.slice(0,3)))return [];const shard=await resource(`/locations/pins/${q.slice(0,3)}.json`);return (shard[q]??[]).map(postalPlace).sort((a:Place,b:Place)=>a.name.localeCompare(b.name));}
 const key=locationKey(q),m=await locationManifest();if(!m.nameKeys.includes(key))return PLACES.filter(p=>normalizePlace(p.name).startsWith(q));
 const rows:any[][]=await resource(`/locations/names/${key}.json`);return rows.filter(r=>(!state||r[2]===state)&&r[7].split('|').some((n:string)=>n.startsWith(q))).map(gazetteerPlace).sort((a,b)=>Number(normalizePlace(b.name)===q)-Number(normalizePlace(a.name)===q)||a.name.localeCompare(b.name)||a.region.localeCompare(b.region));
}
