import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {searchLocations,locationManifest,locationKey} from '../src/locations';
import {KundaliDetails} from '../src/components/KundaliDetails';
import {dignity,aspects,birthFactors,houseRows,NAMING} from '../src/astro/details';
import {DEFAULT_PROFILE,parts,type BirthInput} from '../src/domain';
import {PLACES} from '../src/data/places';
import {engine} from './engine-helper';

test('full India snapshot, PIN returns every row, village and Hindi name search',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(input,options)=>String(input).startsWith('/')?new Response(await readFile(`public${String(input)}`)):original(input,options);
 try{
  const m=await locationManifest();assert.equal(m.settlements,549024);assert.equal(m.postalLocations,155570);assert.equal(m.pincodes,19238);
  for(const [pin,count] of [['302017',4],['209303',15],['208001',29]] as const){const rows=await searchLocations(pin);assert.equal(rows.length,count);assert.ok(rows.every(p=>p.pincode===pin&&p.coordinateQuality==='estimated'));}
  assert.ok((await searchLocations('302017')).some(p=>p.name==='Jagatpura'));
  assert.ok((await searchLocations('Rampur')).length>20);
  assert.ok((await searchLocations('Jaipur','india','Rajasthan')).some(p=>p.name==='Jaipur'));
  assert.ok((await searchLocations('कानपुर')).some(p=>/Kanpur/i.test(p.name)));
  assert.deepEqual(await searchLocations('000000'),[]);assert.deepEqual(await searchLocations('302'),[]);
  assert.equal(locationKey('Rāmpur'),locationKey('Rampur'));
 }finally{globalThis.fetch=original;}
});
test('dignity boundaries, house lords, aspects and every report section in both languages',async()=>{
 const e=await engine();const input:BirthInput={name:'Review',date:'2000-01-01',time:'17:30',certainty:'exact',disambiguation:'reject',place:PLACES[0]};const c=e.chart(input,DEFAULT_PROFILE);
 const merc=c.planets.find(p=>p.id===2)!;
 assert.deepEqual(dignity({...merc,...parts(166),longitude:166},'en'),['Exaltation sign','Own sign','Moolatrikona']);
 assert.deepEqual(dignity({...merc,...parts(170),longitude:170},'en'),['Exaltation sign','Own sign']);
 assert.equal(NAMING.length,27);assert.ok(NAMING.every(row=>row.length===4));
 const houses=houseRows(c);assert.equal(houses.length,12);assert.equal(houses.flatMap(h=>h.planets).length,9);assert.ok(houses.every(h=>h.lord.id<7));
 assert.deepEqual(aspects(c.planets.find(p=>p.id===4)!,c).map(a=>a.count),[4,7,8]);assert.equal(aspects(c.planets.find(p=>p.id===10)!,c).length,0);
 const factors=birthFactors(c,'en');assert.ok(factors.gana&&factors.nadi&&factors.yoni&&factors.syllable);assert.ok(c.sunTimes?.sunrise&&c.sunTimes?.sunset);
 for(const lang of ['en','hi'] as const)for(const section of ['overview','graha','bhava','varga','insights']){const html=renderToStaticMarkup(createElement(KundaliDetails,{chart:c,lang,section,style:'north'}));assert.ok(html.length>500);assert.ok(!html.includes('NaN')&&!html.includes('undefined'),`${lang}/${section}`);}
 const unknown=e.chart({...input,certainty:'unknown',time:''},DEFAULT_PROFILE);assert.deepEqual(houseRows(unknown),[]);const html=renderToStaticMarkup(createElement(KundaliDetails,{chart:unknown,lang:'en',section:'overview',style:'north'}));assert.ok(html.includes('Time required'));
});
