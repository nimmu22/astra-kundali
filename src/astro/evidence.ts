import {norm,parts,planetName,signName,type ChartResult,type Lang} from '../domain';
import {aspects,dignity,HOUSE_THEMES,PLANET_THEMES,houseRows} from './details';
import {SIGN_LORD,subDashas} from './methods';
import {periodContext} from './reading';

// Original editorial explanations. Evidence comes from the calculated D1;
// prompts illustrate house symbolism without inferring individual life events.
export const HOUSE_PRACTICE:[string,string][]=[
 ['self-presentation and the habits you choose','अपना परिचय और चुनी हुई आदतें'],
 ['how you speak, manage a budget and share family responsibilities','बातचीत, बजट और परिवार की ज़िम्मेदारियाँ'],
 ['regular skill practice, writing and taking the first step','नियमित कौशल अभ्यास, लेखन और पहला कदम'],
 ['your living space, family roots and a sense of belonging','रहने का स्थान, पारिवारिक जड़ें और अपनापन'],
 ['creative projects, study and sharing what you learn','रचनात्मक काम, अध्ययन और सीखी बात साझा करना'],
 ['daily work, service and resolving practical problems','दैनिक कार्य, सेवा और व्यावहारिक समस्या सुलझाना'],
 ['collaboration, commitments and clearly stated agreements','सहयोग, प्रतिबद्धता और स्पष्ट समझौते'],
 ['research, adapting to change and managing shared resources','शोध, बदलाव स्वीकारना और साझा संसाधन सँभालना'],
 ['mentors, further learning and the values behind your choices','मार्गदर्शक, आगे की पढ़ाई और निर्णय के मूल्य'],
 ['public responsibilities and the work you build over time','सार्वजनिक ज़िम्मेदारियाँ और समय के साथ बनाया काम'],
 ['support networks, shared goals and the use of gains','सहयोगी समूह, साझा लक्ष्य और लाभ का उपयोग'],
 ['rest, private reflection and keeping track of expenses','विश्राम, निजी चिन्तन और खर्च का हिसाब']
];
export function houseEvidence(c:ChartResult,number:number){
 const house=houseRows(c).find(h=>h.number===number);if(!house)return null;
 const incoming=c.planets.flatMap(p=>aspects(p,c).filter(a=>a.house===number).map(a=>({planet:p,count:a.count})));
 return {...house,incoming};
}
export function planetEvidence(c:ChartResult,id:number){
 const planet=c.planets.find(p=>p.id===id);if(!planet)return null;
 const owned=c.ascendant===null?[]:SIGN_LORD.flatMap((lord,s)=>lord===id?[(s-parts(c.ascendant!).sign+12)%12+1]:[]);
 return {planet,owned};
}
export function explainPlanet(c:ChartResult,id:number,lang:Lang){
 const e=planetEvidence(c,id);if(!e)return '';const {planet:p,owned}=e,i=lang==='hi'?1:0;
 const location=`${planetName(id,lang)} · ${signName(p.sign,lang)}${p.house===null?'':` · ${lang==='hi'?'भाव':'house'} ${p.house}`} · ${dignity(p,lang).join(' / ')}`;
 const themes=PLANET_THEMES[id][i];
 const placement=p.house===null?'':lang==='hi'?` यहाँ ${themes} को ${HOUSE_PRACTICE[p.house-1][1]} से जोड़कर पढ़ें।`:` Read ${themes} through ${HOUSE_PRACTICE[p.house-1][0]}.`;
 const ownership=owned.length?(lang==='hi'?` स्वामित्व: भाव ${owned.join(', ')} — ${owned.map(h=>HOUSE_THEMES[h-1][1]).join('; ')}।`:` Rules houses ${owned.join(', ')} — ${owned.map(h=>HOUSE_THEMES[h-1][0].toLowerCase()).join('; ')}.`):id>=10?(lang==='hi'?' राहु–केतु को यहाँ राशि स्वामित्व नहीं दिया गया है।':' No sign ownership is assigned to Rahu/Ketu in this convention.') : '';
 return `${location}. ${placement}${ownership}`;
}
export function upcomingAntardashas(c:ChartResult,at:number,limit=4){
 if(c.ascendant===null||c.input.certainty==='unknown')return [];
 const ctx=periodContext(c,at);if(!ctx)return [];
 return c.dasha.slice(c.dasha.indexOf(ctx.md)).flatMap(md=>subDashas(md).map(ad=>({...ad,majorLord:md.lord}))).filter(ad=>ad.end>at).slice(0,limit);
}
export function nakshatraArc(c:ChartResult){const moon=c.planets.find(p=>p.id===1)!;const width=40/3,within=norm(moon.longitude)%width;return {within,width,traversed:within/width,remaining:1-within/width};}
