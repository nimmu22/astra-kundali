import type {Capability} from './domain';
export const capabilities:Capability[]=[
 {name:'Astronomical positions & D1',hi:'ग्रह स्थिति और D1',available:true,validation:'WASM/Python comparisons',note:'Moshier, Lahiri/Raman/KP-old; whole-sign houses. Independent astronomical certification is not claimed.'},
 {name:'16 divisional charts',hi:'16 वर्ग कुण्डली',available:true,validation:'Formula and boundary tests',note:'Named Parashari forward variants. D30 boundary correction and D60 natal-sign variant documented.'},
 {name:'Vimshottari & sub-periods',hi:'विंशोत्तरी और अन्तर्दशा',available:true,validation:'Duration and nesting tests',note:'Moon-based birth balance; selectable year length.'},
 {name:'Daily Panchang & windows',hi:'दैनिक पंचांग और समय',available:true,validation:'Numerical comparisons',note:'Hindu geometric sunrise; daily Hora/Choghadiya. Regional festival packs are not implemented.'},
 {name:'Ashtakoota matching',hi:'अष्टकूट मिलान',available:true,validation:'Experimental traditional rules',note:'Raw eight-component scores. Source tables and deliberate Tara/Vasya differences; exceptions unsupported.'},
 {name:'Jaimini study tools',hi:'जैमिनी अध्ययन',available:true,validation:'Experimental variants',note:'7/8 karakas, rashi drishti, fixed-ruler Arudha and natal-AK Karakamsha.'},
 {name:'KP star/sub-lord tables',hi:'KP उपस्वामी सारणी',available:true,validation:'Boundary tests',note:'Planet/cusp lord chains; no complete significator or numbered-horary judgement.'},
 {name:'Tropical solar return',hi:'सौर पुनरागमन',available:true,validation:'Numerical root tests',note:'Natal location. Full Tajika annual analysis, Muntha/Sahams not implemented.'},
 {name:'Ashtakavarga BAV / SAV / Prastara',hi:'अष्टकवर्ग / प्रस्तार',available:true,validation:'203 pinned reference charts',note:'Unreduced Parashari tables; no reductions or pindas. Lagna required.'},
 {name:'Sade Sati / Dhaiya',hi:'साढ़ेसाती / ढैया',available:true,validation:'Sign-entry root checks',note:'Natal-Moon sign convention; retains retrograde re-entries. No event predictions.'},
 {name:'Readable personal report',hi:'सरल व्यक्तिगत व्याख्या',available:true,validation:'Bilingual SSR checks',note:'Original reflection text tied to placements; six life areas and MD/AD/PD context.'},
 {name:'Shadbala',hi:'षड्बल',available:false,validation:'Research required',note:'Full component tables and independent traditional references still required.'},
 {name:'Porutham / regional calendars',hi:'पोरुत्तम / क्षेत्रीय कैलेंडर',available:false,validation:'Research required',note:'Regional rule packs and authoritative examples required.'},
 {name:'Other dashas / Prashna',hi:'अन्य दशा / प्रश्न',available:false,validation:'Research required',note:'Conditional eligibility and variant review required.'},
 {name:'Lal Kitab / Nadi / Pancha Pakshi',hi:'लाल किताब / नाड़ी / पंचपक्षी',available:false,validation:'Research required',note:'Lawful reproducible sources and specialist review required.'},
 {name:'Surya Siddhanta / Vakya',hi:'सूर्य सिद्धान्त / वाक्य',available:false,validation:'Research required',note:'Separate historical mode; no substitution with modern Drik values.'}
];
