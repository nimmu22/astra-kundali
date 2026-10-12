import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {engine} from '../tests/engine-helper';
import {DEFAULT_PROFILE,DAY,type BirthInput,type Place,type Profile} from '../src/domain';
import {PLACES} from '../src/data/places';
import {dateInZone,jdFromEpoch,localDayBounds} from '../src/astro/time';
const e=await engine();const places:Place[]=[PLACES[0],PLACES[3],PLACES[4],PLACES[5],PLACES[8],PLACES[9],{id:'sydney',name:'Sydney',region:'NSW',country:'AU',latitude:-33.8688,longitude:151.2093,timezone:'Australia/Sydney'}];
const charts=[];for(let i=0;i<200;i++){const epoch=Date.UTC(1900+i,0,1)+((i*137)%365)*DAY+(i*917%86400)*1000;const place=places[i%places.length];const local=new Intl.DateTimeFormat('sv-SE',{timeZone:place.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(epoch);const input:BirthInput={name:`Synthetic regression ${i}`,date:local.slice(0,10),time:local.slice(11),certainty:'exact',disambiguation:'earlier',place};const profile:Profile={...DEFAULT_PROFILE,ayanamsha:[1,3,5][i%3] as 1|3|5,nodes:i%2?'true':'mean'};const c=e.chart(input,profile);charts.push({input,profile,epoch:c.resolved.epoch,jd:c.jd,ayanamsa:c.ayanamsa,ascendant:c.ascendant,cusps:c.cusps,planets:c.planets});}
const days=[];for(let i=0;i<1000;i++){const place=places[i%places.length],epoch=Date.UTC(1900,0,2)+i*73*DAY;const date=dateInZone(epoch,place.timezone);const profile:Profile={...DEFAULT_PROFILE,ayanamsha:[1,3,5][i%3] as 1|3|5};const p=e.panchang(date,place,profile);assert.ok(p.sunrise!==null&&p.sunset!==null);for(const event of p.events)assert.ok(event.end!==null&&event.end>p.epoch);days.push({date,place,profile,dayStart:localDayBounds(date,place.timezone).start,epoch:p.epoch,jd:jdFromEpoch(p.epoch),sunrise:p.sunrise,sunset:p.sunset,events:p.events});}
await mkdir('tests/fixtures',{recursive:true});await writeFile('tests/fixtures/numerical-cases.json',JSON.stringify({schemaVersion:1,description:'Synthetic regression cases; not independently certified example charts',charts,days}));
execFileSync('python3',['scripts/reference_check.py'],{stdio:'inherit'});
const summary=JSON.parse(await readFile('tests/fixtures/numerical-summary.json','utf8'));console.log(JSON.stringify(summary,null,2));
