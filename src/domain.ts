export type Lang='en'|'hi';
export type Certainty='exact'|'approximate'|'unknown';
export interface Place {id:string;name:string;region:string;country:string;latitude:number;longitude:number;timezone:string;district?:string;pincode?:string;source?:'gazetteer'|'postal'|'manual';coordinateQuality?:'settlement'|'estimated';aliases?:string}
export interface BirthInput {name:string;date:string;time:string;certainty:Certainty;place:Place;disambiguation:'reject'|'earlier'|'later'}
export interface Profile {ayanamsha:1|3|5;nodes:'mean'|'true';yearDays:number;karakas:7|8}
export interface ResolvedBirthInstant {utc:string;epoch:number;offset:string;timezone:string;tzdb:string}
export interface PlanetPosition {id:number;name:string;short:string;longitude:number;latitude:number;speed:number;flags:number;sign:number;degree:number;nakshatra:number;pada:number;house:number|null}
export interface DashaPeriod {lord:number;start:number;end:number;years:number;children?:DashaPeriod[]}
export interface PanchangEvent {name:string;index:number;end:number|null}
export interface WindowTime {name:string;start:number;end:number}
export interface Panchang {date:string;place:Place;epoch:number;sunrise:number|null;sunset:number|null;weekday:number;events:PanchangEvent[];windows:WindowTime[];hora:WindowTime[];choghadiya:WindowTime[];warning:string|null}
export interface RuleFinding {id:string;title:string;hi:string;details:string;detailsHi:string;source:string;status:string}
export interface ChartResult {input:BirthInput;profile:Profile;resolved:ResolvedBirthInstant;jd:number;ayanamsa:number;ascendant:number|null;cusps:number[];planets:PlanetPosition[];dasha:DashaPeriod[];sunTimes?:{sunrise:number|null;sunset:number|null};moonRange?:{from:number;to:number;changes:boolean};rules:RuleFinding[];metadata:{engine:string;wrapper:string;backend:string;calendar:string;houses:string;createdAt:string;ruleVersion:string};warnings:string[]}
export interface SavedChart {id:string;createdAt:string;input:BirthInput;profile:Profile;result:ChartResult}
export interface MatchingComponent {name:string;hi:string;score:number;max:number;reason:string;source:string}
export interface Capability {name:string;hi:string;available:boolean;validation:string;note:string}
export const DEFAULT_PROFILE:Profile={ayanamsha:1,nodes:'mean',yearDays:365.25636,karakas:7};
export const SIGN_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const SIGN_HI=['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'];
export const NAK_EN=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
export const NAK_HI=['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती'];
export const PLANET_EN=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
export const PLANET_HI=['सूर्य','चन्द्र','बुध','शुक्र','मंगल','गुरु','शनि'];
export const BODY_ORDER=[0,1,4,2,5,3,6,10,11];
export const BODY_NAMES:Record<number,[string,string,string]>={0:['Sun','सूर्य','Su'],1:['Moon','चन्द्र','Mo'],2:['Mercury','बुध','Me'],3:['Venus','शुक्र','Ve'],4:['Mars','मंगल','Ma'],5:['Jupiter','गुरु','Ju'],6:['Saturn','शनि','Sa'],10:['Rahu','राहु','Ra'],11:['Ketu','केतु','Ke']};
export const AYAN_NAMES={1:'Lahiri',3:'Raman',5:'Krishnamurti (old)'};
export const norm=(n:number)=>{const r=n%360;return r<0?r+360:r===0?0:r;};
export const mod=(n:number,m:number)=>{const r=n%m;return r<0?r+m:r===0?0:r;};
export const DAY=86400000;
export function parts(longitude:number){const x=norm(longitude);return {sign:Math.floor(x/30),degree:x%30,nakshatra:Math.floor(x/(40/3)),pada:Math.floor((x%(40/3))/(10/3))+1};}
export function planetName(id:number,lang:Lang){return BODY_NAMES[id]?.[lang==='hi'?1:0]??String(id);}
export function signName(id:number,lang:Lang){return (lang==='hi'?SIGN_HI:SIGN_EN)[mod(id,12)];}
export function nakName(id:number,lang:Lang){return (lang==='hi'?NAK_HI:NAK_EN)[mod(id,27)];}
export function deg(n:number){const seconds=Math.round((n%30)*3600);return `${Math.floor(seconds/3600)}° ${Math.floor(seconds%3600/60)}′ ${seconds%60}″`;}
