import {Temporal} from '@js-temporal/polyfill';
import type {BirthInput,ResolvedBirthInstant} from '../domain';
export function resolveBirth(input:BirthInput):ResolvedBirthInstant{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date))throw new Error('Enter a valid date / सही जन्म तिथि भरें');
 const year=Number(input.date.slice(0,4));if(year<1900||year>2100)throw new Error('Supported dates: 1900–2100 / उपलब्ध वर्ष: 1900–2100');
 if(!/^\d{2}:\d{2}(:\d{2})?$/.test(input.time))throw new Error('Enter a valid birth time / सही जन्म समय भरें');
 if(!Number.isFinite(input.place.latitude)||Math.abs(input.place.latitude)>=90||!Number.isFinite(input.place.longitude)||Math.abs(input.place.longitude)>180)throw new Error('Invalid coordinates / गलत स्थान निर्देशांक');
 try{
 const dt=Temporal.PlainDateTime.from(`${input.date}T${input.time}`,{overflow:'reject'});
 const z=dt.toZonedDateTime(input.place.timezone,{disambiguation:input.disambiguation});
 // Explicit earlier/later may shift a nonexistent civil time: reject that gap.
 if(!z.toPlainDateTime().equals(dt))throw new Error('nonexistent');
 return {utc:z.toInstant().toString(),epoch:z.epochMilliseconds,offset:z.offset,timezone:input.place.timezone,tzdb:'Runtime Intl/IANA rules; exact tzdb version not exposed'};
 }catch{throw new Error('Date/time or timezone is invalid, nonexistent, or repeated. Check the input; choose earlier/later for a repeated DST time. / तिथि, समय या समय क्षेत्र जाँचें।');}
}
export function localDayBounds(date:string,timezone:string){const d=Temporal.PlainDate.from(date);return {start:d.toZonedDateTime({timeZone:timezone,plainTime:'00:00'}).epochMilliseconds,end:d.add({days:1}).toZonedDateTime({timeZone:timezone,plainTime:'00:00'}).epochMilliseconds};}
export const jdFromEpoch=(epoch:number)=>epoch/86400000+2440587.5;
export const epochFromJd=(jd:number)=>(jd-2440587.5)*86400000;
export function dateInZone(epoch:number,timezone:string){return Temporal.Instant.fromEpochMilliseconds(Math.round(epoch)).toZonedDateTimeISO(timezone).toPlainDate().toString();}
export function fmtTime(epoch:number,timezone:string,lang='en'){return new Intl.DateTimeFormat(lang==='hi'?'hi-IN':'en-IN',{timeZone:timezone,hour:'2-digit',minute:'2-digit'}).format(epoch);}
export function fmtDate(epoch:number,timezone='UTC',lang='en'){return new Intl.DateTimeFormat(lang==='hi'?'hi-IN':'en-IN',{timeZone:timezone,day:'numeric',month:'short',year:'numeric'}).format(epoch);}
