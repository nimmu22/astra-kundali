import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PROFILE,DAY,parts,type BirthInput} from '../src/domain';
import {PLACES} from '../src/data/places';
import {resolveBirth,localDayBounds,jdFromEpoch} from '../src/astro/time';
import {varga,VARGAS,dasha,subDashas,kpChain,rashiAspects,karakas,arudha} from '../src/astro/methods';
import {matching,vasya} from '../src/astro/matching';
import {identity,validateImport} from '../src/storage';
import {engine} from './engine-helper';
const birth:BirthInput={name:'Test',date:'2000-01-01',time:'17:30',certainty:'exact',disambiguation:'reject',place:PLACES[0]};
test('UTC, historical offsets, leap dates and coordinate validation',()=>{
 assert.equal(resolveBirth(birth).utc,'2000-01-01T12:00:00Z');assert.equal(jdFromEpoch(resolveBirth(birth).epoch),2451545);
 assert.equal(resolveBirth({...birth,date:'1900-01-01',time:'12:00'}).offset,'+05:21:10');
 for(const b of [{...birth,date:'2001-02-29'},{...birth,time:'24:00'},{...birth,date:'1899-01-01'},{...birth,place:{...birth.place,timezone:'Wrong/Zone'}},{...birth,place:{...birth.place,latitude:90}}])assert.throws(()=>resolveBirth(b));
 assert.equal(resolveBirth({...birth,date:'2000-02-29'}).utc,'2000-02-29T12:00:00Z');
});
test('DST gaps reject; folds require occurrence; civil days may be 23/25h',()=>{
 const ny={...birth,place:{...birth.place,timezone:'America/New_York'}};
 for(const disambiguation of ['reject','earlier','later'] as const)assert.throws(()=>resolveBirth({...ny,date:'2024-03-10',time:'02:30',disambiguation}));
 assert.throws(()=>resolveBirth({...ny,date:'2024-11-03',time:'01:30'}));
 const a=resolveBirth({...ny,date:'2024-11-03',time:'01:30',disambiguation:'earlier'}),b=resolveBirth({...ny,date:'2024-11-03',time:'01:30',disambiguation:'later'});assert.equal(b.epoch-a.epoch,3600000);
 const d=localDayBounds('2024-03-10','America/New_York'),f=localDayBounds('2024-11-03','America/New_York');assert.equal(d.end-d.start,23*3600000);assert.equal(f.end-f.start,25*3600000);
});
test('varga segment boundaries and named variants',()=>{
 assert.equal(Math.floor(varga(0,2)/30),4);assert.equal(Math.floor(varga(15,2)/30),3);assert.equal(Math.floor(varga(30,2)/30),3);assert.equal(Math.floor(varga(45,2)/30),4);
 for(const [degree,sign] of [[0,0],[5,10],[10,8],[18,2],[25,6]])assert.equal(Math.floor(varga(degree,30)/30),sign);
 for(const [degree,sign] of [[30,1],[35,5],[42,11],[50,9],[55,7]])assert.equal(Math.floor(varga(degree,30)/30),sign);
 assert.equal(Math.floor(varga(30,9)/30),9);assert.equal(Math.floor(varga(30,7)/30),7);assert.equal(Math.floor(varga(30,10)/30),9);assert.equal(Math.floor(varga(30,60)/30),1);
 for(const n of VARGAS)for(let i=0;i<12;i++)for(let k=0;k<n;k++)for(const e of [-1e-7,0,1e-7]){const x=varga(i*30+k*30/n+e,n);assert.ok(Number.isFinite(x)&&x>=0&&x<360,`${n}:${i}:${k}:${e}`);}
 assert.equal(parts(360).sign,0);assert.equal(parts(-1e-7).sign,11);assert.equal(parts(40/3).nakshatra,1);
});
test('Vimshottari birth balance and nested intervals close exactly',()=>{
 const birthEpoch=Date.UTC(2000,0,1);for(const year of [360,365.25,365.25636])for(const lon of [0,1e-7,13,40/3,120,359.999]){
 const periods=dasha(lon,birthEpoch,year);assert.ok(periods[0].start<=birthEpoch&&periods[0].end>birthEpoch);assert.ok(Math.abs((periods.at(-1)!.end-periods[0].start)/DAY/year-240)<1e-9);
 for(const p of periods){const subs=subDashas(p);assert.equal(subs[0].start,p.start);assert.equal(subs.at(-1)!.end,p.end);for(let i=1;i<9;i++)assert.equal(subs[i-1].end,subs[i].start);for(const sub of subs){assert.equal(subDashas(sub).at(-1)!.end,sub.end);}}
 }
 assert.deepEqual(kpChain(0),[11,11,11]);assert.equal(kpChain(40/3)[0],3);const end=(40/3)*7/120;assert.equal(kpChain(end-1e-8)[1],11);assert.equal(kpChain(end+1e-8)[1],3);
});
test('Rashi drishti and exact Vasya half-sign boundary',()=>{
 assert.deepEqual(rashiAspects(0),[4,7,10]);assert.deepEqual(rashiAspects(1),[3,6,9]);assert.deepEqual(rashiAspects(2),[5,8,11]);
 assert.equal(vasya(254.999),1);assert.equal(vasya(255),0);assert.equal(vasya(284.999),0);assert.equal(vasya(285),2);
});
test('engine anchor, node types, unknown time, polar handling, solar return',async()=>{
 const e=await engine();const c=e.chart({...birth,place:{...birth.place,latitude:26.9124,longitude:75.7873}},DEFAULT_PROFILE);assert.equal(c.metadata.engine,'Swiss Ephemeris 2.10.03');assert.ok(Math.abs(c.planets[0].longitude-256.51569718931427)<1e-8);assert.ok(Math.abs(c.ascendant!-74.23477335184454)<1e-8);
 assert.equal(c.planets.length,9);assert.equal(c.cusps.length,12);for(const p of c.planets)assert.equal(p.flags&7,4);assert.ok(Math.abs((c.planets[8].longitude-c.planets[7].longitude+360)%360-180)<1e-8);
 const trueNode=e.chart(birth,{...DEFAULT_PROFILE,nodes:'true'});assert.notEqual(trueNode.planets[7].longitude,c.planets[7].longitude);
 const u=e.chart({...birth,certainty:'unknown',time:''},DEFAULT_PROFILE);assert.equal(u.ascendant,null);assert.deepEqual(u.dasha,[]);assert.deepEqual(u.cusps,[]);assert.ok(u.moonRange);assert.throws(()=>matching(c,u));
 const polar=e.panchang('2024-06-21',{...birth.place,latitude:78.2232,longitude:15.6469,timezone:'Arctic/Longyearbyen'},DEFAULT_PROFILE);assert.equal(polar.sunrise,null);assert.equal(polar.windows.length,0);assert.ok(polar.warning);
 const returnChart=e.solarReturn(c,2024);const tropical=(epoch:number)=>e.swe.calculatePosition(jdFromEpoch(epoch),0,260).longitude;assert.ok(Math.abs(tropical(returnChart.resolved.epoch)-tropical(c.resolved.epoch))<.00002);
 const ks=karakas(c.planets,8);assert.equal(ks.length,8);assert.ok(ks.every((p,i)=>!i||ks[i-1].rankDegree>=p.rankDegree));assert.ok(arudha(2,c.planets)>=0);
 for(let i=0;i<27;i++){const a={...c,planets:c.planets.map(p=>p.id===1?{...p,...parts(i*40/3+1),longitude:i*40/3+1}:p)};for(let j=0;j<27;j++){const b={...c,planets:c.planets.map(p=>p.id===1?{...p,...parts(j*40/3+1),longitude:j*40/3+1}:p)};for(const component of matching(a,b))assert.ok(component.score>=0&&component.score<=component.max);}}
 const exported=JSON.stringify({schemaVersion:1,charts:[{input:birth,profile:DEFAULT_PROFILE,result:{tampered:true}}]});assert.equal(validateImport(exported)[0].input.name,'Test');assert.equal((validateImport(exported)[0] as any).result,undefined);assert.throws(()=>validateImport('{broken'));assert.throws(()=>validateImport(JSON.stringify({schemaVersion:1,charts:[{input:birth,profile:{...DEFAULT_PROFILE,ayanamsha:99}}]})));assert.equal(identity(birth,DEFAULT_PROFILE),identity({...birth,name:'Renamed'},DEFAULT_PROFILE));
});
