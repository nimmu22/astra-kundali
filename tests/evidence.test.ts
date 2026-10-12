import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parts,type ChartResult} from '../src/domain';
import example from '../src/data/studio-example.json';
import {houseEvidence,planetEvidence,explainPlanet,nakshatraArc,upcomingAntardashas} from '../src/astro/evidence';
import {subDashas} from '../src/astro/methods';
import {HouseExplanation,NextPeriods,ReportGuide} from '../src/components/ReadingEvidence';
import {StudioOverview} from '../src/components/StudioOverview';
import {engine} from './engine-helper';
const c=example as ChartResult;
test('Example is reproducible from the engine and matches the checked Jaipur anchor',async()=>{
 const e=await engine(),actual=e.chart(c.input,c.profile);
 assert.equal(parts(actual.ascendant!).sign,11);const moon=actual.planets.find(p=>p.id===1)!;
 assert.equal(moon.sign,6);assert.equal(moon.nakshatra,14);assert.equal(moon.pada,4);
 assert.ok(Math.abs(actual.ascendant!-c.ascendant!)<1e-9);
 for(const p of c.planets)assert.ok(Math.abs(actual.planets.find(x=>x.id===p.id)!.longitude-p.longitude)<1e-9);
});
test('House evidence retains special Mars/Saturn/Jupiter aspects, excludes node aspects and unknown houses',()=>{
 const synthetic={...c,ascendant:0,planets:c.planets.map(p=>({...p,longitude:0,sign:0,degree:0,house:1}))};
 assert.deepEqual(houseEvidence(synthetic,4)!.incoming.map(x=>x.planet.id),[4]);
 assert.deepEqual(houseEvidence(synthetic,3)!.incoming.map(x=>x.planet.id),[6]);
 assert.deepEqual(houseEvidence(synthetic,5)!.incoming.map(x=>x.planet.id),[5]);
 assert.deepEqual(houseEvidence(synthetic,7)!.incoming.map(x=>x.planet.id).sort((a,b)=>a-b),[0,1,2,3,4,5,6]);
 assert.equal(houseEvidence({...c,ascendant:null},1),null);
 assert.deepEqual(planetEvidence(c,10)!.owned,[]);assert.deepEqual(planetEvidence(c,5)!.owned.sort((a,b)=>a-b),[1,10]);
 assert.equal(explainPlanet(c,999,'en'),'');
});
test('Upcoming ADs preserve contiguous intervals across MD boundary and unknown time is withheld',()=>{
 const md=c.dasha[1],ads=subDashas(md),at=ads.at(-1)!.end-1,rows=upcomingAntardashas(c,at);
 assert.equal(rows[0].start,ads.at(-1)!.start);assert.equal(rows[0].end,rows[1].start);
 assert.equal(rows[0].majorLord,md.lord);assert.equal(rows[1].majorLord,c.dasha[2].lord);
 assert.deepEqual(upcomingAntardashas({...c,ascendant:null},at),[]);
 assert.deepEqual(upcomingAntardashas(c,c.dasha.at(-1)!.end),[]);
 const arc=nakshatraArc(c);assert.ok(arc.traversed>=0&&arc.traversed<1);assert.ok(Math.abs(arc.traversed+arc.remaining-1)<1e-12);
});
test('Studio and evidence explanations render bilingually with genuine facts and clear sample labels',()=>{
 for(const lang of ['en','hi'] as const){for(const component of [createElement(StudioOverview,{lang,onExample:()=>{},onPanchang:()=>{},busy:false}),createElement(HouseExplanation,{chart:c,number:10,lang}),createElement(NextPeriods,{chart:c,lang,at:c.resolved.epoch}),createElement(ReportGuide,{lang,onSection:()=>{}})]){const html=renderToStaticMarkup(component);assert.ok(!/NaN|undefined/.test(html));assert.ok(html.length>500);}
 const html=renderToStaticMarkup(createElement(StudioOverview,{lang,onExample:()=>{},onPanchang:()=>{},busy:true}));assert.ok(html.includes(lang==='hi'?'काल्पनिक उदाहरण':'FICTIONAL EXAMPLE'));assert.ok(html.includes('aria-pressed="true"'));assert.ok(html.includes('disabled=""'));
 }
});
