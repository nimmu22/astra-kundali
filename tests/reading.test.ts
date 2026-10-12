import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DEFAULT_PROFILE,DAY,parts,mod,type ChartResult,type BirthInput} from '../src/domain';
import {PLACES} from '../src/data/places';
import {periodContext,birthBalance,readingAreas,kaalSarp,saturnPhase} from '../src/astro/reading';
import {ashtakavarga,ASHTAKAVARGA_PLANET_IDS} from '../src/astro/ashtakavarga';
import {PersonalReading,DashaReading,NodeScreen,SaturnPanel,AshtakavargaPanel} from '../src/components/PersonalReading';
import {engine} from './engine-helper';
const fixture=JSON.parse(await readFile('tests/fixtures/numerical-cases.json','utf8')).charts[125] as ChartResult;
const signChart=(signs:number[])=>({...fixture,input:{...fixture.input,certainty:'exact' as const},ascendant:signs[7]*30,planets:fixture.planets.map(p=>{const index=ASHTAKAVARGA_PLANET_IDS.indexOf(p.id as typeof ASHTAKAVARGA_PLANET_IDS[number]);return index<0?p:{...p,...parts(signs[index]*30+10),longitude:signs[index]*30+10};})});
test('Ashtakavarga pinned golden vectors, total 337 and zodiac rotation',()=>{
 const all=ashtakavarga(signChart(Array(8).fill(0)))!;assert.deepEqual(all.sav,[24,22,29,26,25,34,19,26,26,36,54,16]);
 assert.deepEqual(all.bav.map(row=>row.reduce((a,b)=>a+b)),[48,49,39,54,56,52,39]);
 const a=ashtakavarga(signChart([0,1,2,3,4,5,6,7]))!;assert.deepEqual(a.sav,[30,27,29,31,25,27,21,28,28,30,30,31]);
 for(let shift=1;shift<12;shift++){const b=ashtakavarga(signChart([0,1,2,3,4,5,6,7].map(s=>mod(s+shift,12))))!;assert.equal(b.sav.reduce((x,y)=>x+y),337);for(let sign=0;sign<12;sign++)assert.equal(b.sav[mod(sign+shift,12)],a.sav[sign]);}
 assert.equal(ashtakavarga({...fixture,ascendant:null}),null);
});
test('Dasha active interval boundaries, birth balance and six calculated life areas',async()=>{
 const e=await engine(),c=e.chart({name:'Balance',date:'2000-01-01',time:'12:00',certainty:'exact',disambiguation:'reject',place:PLACES[0]},DEFAULT_PROFILE),first=c.dasha[0];assert.equal(periodContext(c,first.end)!.md.lord,c.dasha[1].lord);assert.equal(periodContext(c,first.start-1),null);
 const b=birthBalance(c)!;assert.ok(b.days>0);assert.equal(b.lord,first.lord);assert.ok(Math.abs(b.years*c.profile.yearDays-b.days)<1e-9);
 assert.equal(readingAreas(c).length,6);assert.deepEqual(readingAreas({...c,ascendant:null}),[]);
});
test('Kaal Sarp wraparound, split semicircles, axis ambiguity and unknown time',()=>{
 const make=(longitudes:number[])=>({...fixture,planets:fixture.planets.map(p=>({...p,longitude:p.id===10?350:p.id===11?170:longitudes[p.id]}))});
 assert.equal(kaalSarp(make([0,20,40,60,80,100,120]))!.contained,true);
 assert.equal(kaalSarp(make([0,20,40,60,80,100,200]))!.contained,false);
 const boundary=kaalSarp(make([350,20,40,60,80,100,120]))!;assert.equal(boundary.onBoundary,true);assert.equal(boundary.contained,false);
 assert.equal(kaalSarp({...fixture,input:{...fixture.input,certainty:'unknown'}}),null);
 for(let house=1;house<=12;house++){const phase=saturnPhase(mod(6+house-1,12),6);assert.equal(phase.house,house);assert.equal(phase.phase,house===12?'rising':house===1?'central':house===2?'setting':house===4||house===8?'dhaiya':'outside');}
});
test('Saturn continuous sign segments, both direct and retrograde roots, bilingual reports',async()=>{
 const e=await engine(),input:BirthInput={name:'Example',date:'2000-01-01',time:'12:00',certainty:'exact',disambiguation:'reject',place:{...PLACES[0],name:'Jaipur',latitude:26.9166667,longitude:75.7833333}};
 const c=e.chart(input,DEFAULT_PROFILE),r=e.saturnTimeline(c,Date.UTC(2026,9,11));assert.equal(r.segments[0].start,c.resolved.epoch);assert.equal(r.segments.at(-1)!.end,r.scanEnd);assert.ok(r.segments.length>40);let retrograde=0;
 for(let i=1;i<r.segments.length;i++){const a=r.segments[i-1],b=r.segments[i];assert.equal(a.end,b.start);assert.ok(b.end>b.start);const step=mod(b.sign-a.sign,12);assert.ok(step===1||step===11);if(step===11)retrograde++;
 assert.equal(parts(e.position(b.start-1000,6,c.profile).longitude).sign,a.sign);assert.equal(parts(e.position(b.start+1000,6,c.profile).longitude).sign,b.sign);}
 assert.ok(retrograde>2);assert.throws(()=>e.saturnTimeline({...c,ascendant:null},r.asOf));assert.throws(()=>e.saturnTimeline(c,NaN));
 for(const lang of ['en','hi'] as const){for(const el of [createElement(PersonalReading,{chart:c,lang,style:'north'}),createElement(DashaReading,{chart:c,lang,at:r.asOf}),createElement(NodeScreen,{chart:c,lang}),createElement(SaturnPanel,{chart:c,lang,report:r,loading:false,error:''}),createElement(AshtakavargaPanel,{chart:c,lang})]){const html=renderToStaticMarkup(el);assert.ok(html.length>300);assert.ok(!/NaN|undefined/.test(html));assert.ok(!html.includes('Moshier')&&!html.includes('Engine'));}
 const unknown=e.chart({...input,certainty:'unknown',time:''},DEFAULT_PROFILE);const html=renderToStaticMarkup(createElement(PersonalReading,{chart:unknown,lang,style:'south'}));assert.ok(!/NaN|undefined/.test(html));const unavailable=renderToStaticMarkup(createElement(AshtakavargaPanel,{chart:unknown,lang}));assert.ok(!unavailable.includes('sav-row'));}
 const later=e.chart({...input,date:'2100-12-31'},DEFAULT_PROFILE),short=e.saturnTimeline(later,r.asOf);assert.ok(short.scanEnd-short.scanStart<2*DAY);assert.equal(periodContext(later,r.asOf),null);
});
