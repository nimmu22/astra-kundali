import {SwissEphemeris,HouseSystem} from '@swisseph/browser';
import {BODY_NAMES,BODY_ORDER,DAY,NAK_EN,norm,mod,parts,type BirthInput,type ChartResult,type Place,type Profile,type Panchang,type WindowTime} from '../domain';
import {resolveBirth,jdFromEpoch,epochFromJd,localDayBounds} from './time';
import {dasha,findings} from './methods';
import {saturnPhase,type SaturnReport} from './reading';
const FLAGS=4|256|65536;
const TITHI=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi'];
const YOGA=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
export class AstroEngine{
 readonly swe=new SwissEphemeris();
 async init(wasmPath?:string){await this.swe.init(wasmPath);}
 saturnTimeline(chart:ChartResult,asOf:number):SaturnReport{
  if(chart.ascendant===null)throw new Error('Add your birth time to calculate a personal Saturn timeline.');
  if(!Number.isFinite(asOf)||asOf<Date.UTC(1900,0,1)||asOf>=Date.UTC(2101,0,1))throw new Error('Saturn reference date must be within 1900–2100.');
  const moon=chart.planets.find(p=>p.id===1)!,birthYear=Number(chart.input.date.slice(0,4));
  const scanStart=chart.resolved.epoch,scanEnd=Date.UTC(Math.min(birthYear+101,2101),0,1);
  const signAt=(t:number)=>parts(this.position(t,6,chart.profile).longitude).sign;
  const segments:SaturnReport['segments']=[];let start=scanStart,previous=signAt(start),left=start;
  for(let right=Math.min(left+DAY,scanEnd);left<scanEnd;right=Math.min(right+DAY,scanEnd)){
   const sign=signAt(right);
   if(sign!==previous){let lo=left,hi=right;for(let j=0;j<22;j++){const mid=(lo+hi)/2;if(signAt(mid)===previous)lo=mid;else hi=mid;}const boundary=Math.round((lo+hi)/2);segments.push({start,end:boundary,sign:previous,...saturnPhase(previous,moon.sign)});start=boundary;previous=sign;}
   left=right;
  }
  segments.push({start,end:scanEnd,sign:previous,...saturnPhase(previous,moon.sign)});
  const longitude=this.position(asOf,6,chart.profile).longitude;return {asOf,longitude,sign:parts(longitude).sign,scanStart,scanEnd,segments};
 }
 position(epoch:number,id:number,profile:Profile){this.swe.setSiderealMode(profile.ayanamsha);const body=id===10||id===11?(profile.nodes==='mean'?10:11):id;const p=this.swe.calculatePosition(jdFromEpoch(epoch),body,FLAGS);if((p.flags&7)!==4)throw new Error('Unexpected ephemeris backend; calculation stopped.');return {...p,longitude:norm(p.longitude+(id===11?180:0))};}
 chart(input:BirthInput,profile:Profile):ChartResult{
 const refInput=input.certainty==='unknown'?{...input,time:'00:00'}:input;
 const resolved=resolveBirth(refInput),epoch=resolved.epoch,jd=jdFromEpoch(epoch);this.swe.setSiderealMode(profile.ayanamsha);
 const ayanamsa=this.swe.getAyanamsaExUt(jd,4);const known=input.certainty!=='unknown';
 let ascendant:number|null=null,cusps:number[]=[];
 if(known){const h=this.swe.calculateHouses(jd,input.place.latitude,input.place.longitude,HouseSystem.WholeSign);ascendant=norm(h.ascendant-ayanamsa);
 if(Math.abs(input.place.latitude)<66){const kp=this.swe.calculateHouses(jd,input.place.latitude,input.place.longitude,HouseSystem.Placidus);cusps=kp.cusps.slice(1,13).map(x=>norm(x-ayanamsa));}}
 const planets=BODY_ORDER.map(id=>{const p=this.position(epoch,id,profile);const q=parts(p.longitude);return {id,name:BODY_NAMES[id][0],short:BODY_NAMES[id][2],longitude:p.longitude,latitude:p.latitude,speed:p.longitudeSpeed,flags:p.flags,...q,house:ascendant===null?null:mod(q.sign-Math.floor(ascendant/30),12)+1};});
 const moon=planets.find(p=>p.id===1)!;const warnings:string[]=[];
 if(input.certainty==='approximate')warnings.push('Birth time is approximate. Houses and high divisional charts may change within the uncertainty interval.');
 let moonRange:ChartResult['moonRange'];
 if(!known){const bounds=localDayBounds(input.date,input.place.timezone);const end=this.position(bounds.end-1,1,profile).longitude;moonRange={from:moon.longitude,to:end,changes:parts(end).nakshatra!==moon.nakshatra||parts(end).sign!==moon.sign};warnings.push('Time unknown: positions show the start of the local day. Ascendant, houses and dasha timing are withheld. Moon values can change during the day.');}
 if(Math.abs(input.place.latitude)>=66)warnings.push('Placidus/KP cusps are unavailable at this latitude. Whole-sign display is retained explicitly.');
 if(input.place.coordinateQuality==='estimated')warnings.push('PIN coordinates are an estimated reference point. Verify the exact birth location before relying on house or high-varga boundaries.');
 return {input,profile,resolved,jd,ayanamsa,ascendant,cusps,planets,dasha:known?dasha(moon.longitude,epoch,profile.yearDays):[],sunTimes:this.sunEvents(input.date,input.place),moonRange,rules:findings(planets,ascendant),metadata:{engine:`Swiss Ephemeris ${this.swe.version()}`,wrapper:'@swisseph/browser 1.4.0',backend:'Moshier (explicit flags 4; built-in, no external ephemeris files)',calendar:'Proleptic Gregorian; supported years 1900–2100',houses:'Whole-sign natal houses; tropical Placidus cusps minus apparent ayanamsha for KP',createdAt:new Date().toISOString(),ruleVersion:'astra-0.3.0'},warnings};
 }
 solarAltitude(epoch:number,place:Place){const p=this.swe.calculatePosition(jdFromEpoch(epoch),0,4|256);return this.swe.horizontalCoordinates(jdFromEpoch(epoch),{longitude:place.longitude,latitude:place.latitude,altitude:0},[p.longitude,0,p.distance]).altitude;}
 sunEvents(date:string,place:Place){const {start,end}=localDayBounds(date,place.timezone);let sunrise:number|null=null,sunset:number|null=null;let a=start,va=this.solarAltitude(a,place);for(let b=start+10*60000;b<=end+10*60000;b+=10*60000){const limit=Math.min(b,end),vb=this.solarAltitude(limit,place);if((va<0&&vb>=0)||(va>=0&&vb<0)){let lo=a,hi=limit;const rising=va<0;for(let j=0;j<26;j++){const mid=(lo+hi)/2;const vm=this.solarAltitude(mid,place);if((vm>=0)===rising)hi=mid;else lo=mid;}const t=(lo+hi)/2;if(rising&&sunrise===null)sunrise=t;else if(!rising&&sunset===null)sunset=t;}a=limit;va=vb;if(limit===end)break;}return {sunrise,sunset};}
 phase(epoch:number,profile:Profile,kind:number){const sun=this.position(epoch,0,profile).longitude,moon=this.position(epoch,1,profile).longitude;return kind===1?moon:kind===2?norm(moon+sun):norm(moon-sun);}
 transition(epoch:number,profile:Profile,kind:number,width:number){const initial=this.phase(epoch,profile,kind),distance=width-mod(initial,width);let lo=epoch;for(let hi=epoch+3600000;hi<=epoch+4*DAY;hi+=3600000){const advanced=norm(this.phase(hi,profile,kind)-initial);if(advanced>=distance){for(let j=0;j<28;j++){const mid=(lo+hi)/2;if(norm(this.phase(mid,profile,kind)-initial)>=distance)hi=mid;else lo=mid;}return Math.round((lo+hi)/2);}lo=hi;}return null;}
 panchang(date:string,place:Place,profile:Profile):Panchang{
 const bounds=localDayBounds(date,place.timezone);if(Number(date.slice(0,4))<1900||Number(date.slice(0,4))>2100)throw new Error('Panchang supports 1900–2100.');
 const {sunrise,sunset}=this.sunEvents(date,place);const epoch=sunrise??bounds.start;
 const phase=this.phase(epoch,profile,0),moon=this.phase(epoch,profile,1),sum=this.phase(epoch,profile,2);const ti=Math.floor(phase/12),ni=Math.floor(moon/(40/3)),yi=Math.floor(sum/(40/3)),ki=Math.floor(phase/6);
 const karana=ki===0?'Kimstughna':ki===57?'Shakuni':ki===58?'Chatushpada':ki===59?'Naga':['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'][(ki-1)%7];
 const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();const windows:WindowTime[]=[],hora:WindowTime[]=[],choghadiya:WindowTime[]=[];
 if(sunrise!==null&&sunset!==null&&sunset>sunrise){const eighth=(sunset-sunrise)/8;for(const [name,slots]of [['Rahu Kalam',[8,2,7,5,6,4,3]],['Yamaganda',[5,4,3,2,1,7,6]],['Gulika',[7,6,5,4,3,2,1]]] as const){const k=slots[weekday]-1;windows.push({name,start:sunrise+k*eighth,end:sunrise+(k+1)*eighth});}
 const order=[6,5,4,0,3,2,1],lord=[0,1,4,2,5,3,6][weekday];const offset=order.indexOf(lord);for(let i=0;i<12;i++)hora.push({name:BODY_NAMES[order[(offset+i)%7]][0],start:sunrise+i*(sunset-sunrise)/12,end:sunrise+(i+1)*(sunset-sunrise)/12});
 const cycles=[['Udveg','Chal','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],['Amrit','Kaal','Shubh','Rog','Udveg','Chal','Labh','Amrit'],['Rog','Udveg','Chal','Labh','Amrit','Kaal','Shubh','Rog'],['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Chal','Labh'],['Shubh','Rog','Udveg','Chal','Labh','Amrit','Kaal','Shubh'],['Chal','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Chal'],['Kaal','Shubh','Rog','Udveg','Chal','Labh','Amrit','Kaal']];cycles[weekday].forEach((name,i)=>choghadiya.push({name,start:sunrise+i*eighth,end:sunrise+(i+1)*eighth}));}
 return {date,place,epoch,sunrise,sunset,weekday,events:[{name:ti===14?'Purnima':ti===29?'Amavasya':`${ti<15?'Shukla':'Krishna'} ${TITHI[ti%15]}`,index:ti,end:this.transition(epoch,profile,0,12)},{name:NAK_EN[ni],index:ni,end:this.transition(epoch,profile,1,40/3)},{name:YOGA[yi],index:yi,end:this.transition(epoch,profile,2,40/3)},{name:karana,index:ki,end:this.transition(epoch,profile,0,6)}],windows,hora,choghadiya,warning:sunrise===null||sunset===null?'No complete sunrise/sunset pair on this civil day. Sunrise-based windows are unavailable.':null};
 }
 solarReturn(chart:ChartResult,year:number):ChartResult{
 if(chart.ascendant===null)throw new Error('Solar return requires a known birth time.');if(year<1901||year>2099)throw new Error('Solar-return years: 1901–2099.');
 const natalSun=this.swe.calculatePosition(chart.jd,0,4|256).longitude;const month=chart.input.date.slice(5);const base=Date.parse(`${year}-${month==='02-29'?'02-28':month}T12:00:00Z`);const delta=(t:number)=>mod(this.swe.calculatePosition(jdFromEpoch(t),0,4|256).longitude-natalSun+180,360)-180;
 let lo=base-4*DAY,hi=base+4*DAY;if(delta(lo)>=0||delta(hi)<=0)throw new Error('Solar return could not be bracketed.');for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(delta(mid)>0)hi=mid;else lo=mid;}
 const epoch=Math.round((lo+hi)/2);const inZone=new Intl.DateTimeFormat('sv-SE',{timeZone:chart.input.place.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(epoch).replace(' ','T');
 const r=this.chart({...chart.input,name:`${chart.input.name||'Chart'} · Solar return ${year}`,date:inZone.slice(0,10),time:inZone.slice(11,19),certainty:'exact'},chart.profile);r.warnings.push('Tropical Sun return at the natal location; not a full Tajika judgement.');return r;
 }
}
