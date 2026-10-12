import {DAY,mod,norm,parts,type ChartResult,type Lang} from '../domain';
import {SIGN_LORD,subDashas} from './methods';
import {houseRows} from './details';

// Original editorial descriptions of conventional zodiac symbolism. These are
// reflection prompts, not psychological measurements or individual forecasts.
export const SIGN_READING:[string,string][]=[
 ['Initiative, direct expression and a wish to act. Notice how you balance a quick start with patient follow-through.','पहल, सीधी बात और आगे बढ़ने की इच्छा। जल्दी शुरुआत के साथ धैर्य और काम पूरा करने पर ध्यान दें।'],
 ['Consistency, practical comfort and steady effort. Notice what helps you feel secure and when flexibility is useful.','स्थिरता, व्यावहारिक सुख और लगातार मेहनत। क्या आपको भरोसा देता है और कहाँ बदलाव स्वीकारना उपयोगी है, देखें।'],
 ['Curiosity, conversation and learning through variety. Notice how you turn many interests into a clear priority.','जिज्ञासा, बातचीत और अलग अनुभवों से सीखना। कई रुचियों में से अपनी प्राथमिकता कैसे चुनते हैं, देखें।'],
 ['Care, belonging and emotional memory. Notice how you balance looking after others with your own needs.','देखभाल, अपनापन और भावनात्मक यादें। दूसरों का ध्यान रखने के साथ अपनी ज़रूरतों का ध्यान भी देखें।'],
 ['Creative expression, recognition and a wish to lead. Notice how you share your strengths and make room for others.','रचनात्मकता, पहचान और नेतृत्व। अपनी क्षमता दिखाने के साथ दूसरों को जगह देने पर ध्यान दें।'],
 ['Observation, useful skills and improving details. Notice when careful analysis helps and when a decision needs to move forward.','बारीक निरीक्षण, उपयोगी कौशल और सुधार। कब विश्लेषण मदद करता है और कब निर्णय आगे बढ़ाना चाहिए, देखें।'],
 ['Cooperation, fairness and balance in relationships. Notice how you express your own preferences while considering others.','सहयोग, न्याय और सम्बन्धों में संतुलन। दूसरों को समझते हुए अपनी पसंद कैसे व्यक्त करते हैं, देखें।'],
 ['Depth, privacy and a wish to understand what lies beneath the surface. Notice how trust develops and how you handle change.','गहराई, निजता और बात की जड़ समझना। भरोसा कैसे बनता है और बदलाव से कैसे निपटते हैं, देखें।'],
 ['Exploration, wider learning and a search for meaning. Notice how a large vision connects with practical steps.','नई खोज, व्यापक ज्ञान और अर्थ की तलाश। बड़े लक्ष्य को व्यावहारिक कदमों से कैसे जोड़ते हैं, देखें।'],
 ['Structure, responsibility and patient progress. Notice how you balance long-term commitments with time to rest.','अनुशासन, ज़िम्मेदारी और धैर्य से प्रगति। लम्बी ज़िम्मेदारियों के बीच विश्राम का समय कैसे रखते हैं, देखें।'],
 ['Independent ideas, communities and a wider social view. Notice how your ideas connect with close personal relationships.','स्वतन्त्र विचार, समूह और समाज की दृष्टि। अपने विचारों के साथ निजी सम्बन्ध कैसे निभाते हैं, देखें।'],
 ['Imagination, empathy and a receptive outlook. Notice how you turn inspiration into clear boundaries and everyday routines.','कल्पना, सहानुभूति और संवेदनशील दृष्टि। प्रेरणा को स्पष्ट सीमाओं और दैनिक दिनचर्या में कैसे बदलते हैं, देखें।']
];
export const DASHA_THEME:Record<number,[string,string]>={
 0:['visibility, responsibility and the way you express authority','पहचान, ज़िम्मेदारी और नेतृत्व का तरीका'],
 1:['emotional needs, home and everyday habits','भावनात्मक ज़रूरतें, घर और रोज़मर्रा की आदतें'],
 4:['initiative, effort and how you respond to challenges','पहल, प्रयास और चुनौतियों का सामना'],
 2:['learning, communication and practical decisions','सीखना, संवाद और व्यावहारिक निर्णय'],
 5:['education, guidance and the values behind your plans','शिक्षा, मार्गदर्शन और आपके लक्ष्य के मूल्य'],
 3:['relationships, cooperation and what you value','सम्बन्ध, सहयोग और आपकी पसंद'],
 6:['routines, sustained work and long-term commitments','दिनचर्या, लगातार मेहनत और लम्बी ज़िम्मेदारियाँ'],
 10:['new experiences, ambition and unfamiliar directions','नए अनुभव, महत्त्वाकांक्षा और अपरिचित रास्ते'],
 11:['reflection, simplifying priorities and inward interests','आत्मचिन्तन, प्राथमिकताओं को सरल करना और भीतर का ध्यान']
};
export const LIFE_AREAS:{id:string;title:[string,string];houses:number[];focus:[string,string]}[]=[
 {id:'career',title:['Career & work','करियर और कार्य'],houses:[10,6],focus:['Work, public responsibilities, service and everyday skills are considered together.','कार्य, सार्वजनिक ज़िम्मेदारी, सेवा और रोज़मर्रा के कौशल को साथ पढ़ा जाता है।']},
 {id:'learning',title:['Education & learning','शिक्षा और सीखना'],houses:[5,9],focus:['Learning interests, judgement, mentors and higher study are considered together.','सीखने की रुचि, निर्णय क्षमता, मार्गदर्शक और उच्च शिक्षा को साथ देखा जाता है।']},
 {id:'relationships',title:['Relationships & partnership','सम्बन्ध और साझेदारी'],houses:[7,5],focus:['Partnership, agreements and personal expression are considered together.','साझेदारी, समझौते और अपनी बात व्यक्त करने को साथ देखा जाता है।']},
 {id:'resources',title:['Money & resources','धन और संसाधन'],houses:[2,11],focus:['Stored resources, family support, networks and gains are considered together.','संसाधन, पारिवारिक सहयोग, मित्र समूह और लाभ को साथ देखा जाता है।']},
 {id:'home',title:['Home & family','घर और परिवार'],houses:[4,2],focus:['Home, roots, comfort, family life and communication are considered together.','घर, जड़ें, सुख, पारिवारिक जीवन और वाणी को साथ पढ़ा जाता है।']},
 {id:'routines',title:['Habits & personal balance','आदतें और व्यक्तिगत संतुलन'],houses:[1,6,12],focus:['Self-expression, daily routines and rest are considered together.','स्वभाव, रोज़ की दिनचर्या और विश्राम को साथ देखा जाता है।']}
];
export function readingAreas(c:ChartResult){const rows=houseRows(c);if(!rows.length)return [];return LIFE_AREAS.map(a=>({...a,placements:a.houses.map(h=>rows[h-1])}));}
export function periodContext(c:ChartResult,at:number){const md=c.dasha.find(p=>p.start<=at&&at<p.end);if(!md)return null;const ad=subDashas(md).find(p=>p.start<=at&&at<p.end)!;const pd=subDashas(ad).find(p=>p.start<=at&&at<p.end)!;const planet=c.planets.find(p=>p.id===md.lord)!;const owned=c.ascendant===null?[]:SIGN_LORD.flatMap((lord,s)=>lord===planet.id?[mod(s-parts(c.ascendant!).sign,12)+1]:[]);return {md,ad,pd,planet,owned};}
export function birthBalance(c:ChartResult){if(!c.dasha.length)return null;const p=c.dasha.find(p=>p.start<=c.resolved.epoch&&c.resolved.epoch<p.end)!;const days=(p.end-c.resolved.epoch)/DAY;return {lord:p.lord,end:p.end,days,years:days/c.profile.yearDays};}
export function kaalSarp(c:ChartResult){if(c.input.certainty==='unknown')return null;const rahu=c.planets.find(p=>p.id===10)!,ketu=c.planets.find(p=>p.id===11)!;const planets=c.planets.filter(p=>p.id<7);const rows=planets.map(p=>({...p,arc:norm(p.longitude-rahu.longitude)}));const onBoundary=rows.some(p=>Math.min(p.arc,Math.abs(p.arc-180),360-p.arc)<1e-7);return {rahu,ketu,rows,onBoundary,contained:!onBoundary&&(rows.every(p=>p.arc>0&&p.arc<180)||rows.every(p=>p.arc>180&&p.arc<360))};}
export function saturnPhase(saturnSign:number,moonSign:number){const house=mod(saturnSign-moonSign,12)+1;return {house,phase:house===12?'rising':house===1?'central':house===2?'setting':house===4||house===8?'dhaiya':'outside'} as const;}
export interface SaturnSegment {start:number;end:number;sign:number;house:number;phase:'rising'|'central'|'setting'|'dhaiya'|'outside'}
export interface SaturnReport {asOf:number;longitude:number;sign:number;scanStart:number;scanEnd:number;segments:SaturnSegment[]}
export function phaseName(phase:SaturnSegment['phase'],lang:Lang){const names={rising:['Sade Sati · first phase','साढ़ेसाती · पहला चरण'],central:['Sade Sati · middle phase','साढ़ेसाती · मध्य चरण'],setting:['Sade Sati · final phase','साढ़ेसाती · अन्तिम चरण'],dhaiya:['Dhaiya · 4th/8th from Moon','ढैया · चन्द्र से चौथा/आठवाँ'],outside:['Outside Sade Sati / Dhaiya','साढ़ेसाती / ढैया से बाहर']};return names[phase][lang==='hi'?1:0];}
