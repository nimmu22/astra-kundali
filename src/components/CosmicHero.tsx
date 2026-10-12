import {ArrowUpRight,ArrowDown,ShieldCheck,MapPin} from 'lucide-react';
import type {Lang} from '../domain';
export function AstraLogo(){return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5L42 39H32L24 23L16 39H6Z" fill="currentColor"/><path d="M8 32C6 37 11 40 21 36C32 32 44 22 43 16C42 12 35 13 27 17" fill="none" stroke="var(--gold)" strokeWidth="1.7"/><circle cx="42" cy="15" r="2" fill="var(--gold)"/></svg>;}
const GRAHAS=[['☉','Sun','सूर्य'],['☽','Moon','चन्द्र'],['♂','Mars','मंगल'],['☿','Mercury','बुध'],['♃','Jupiter','गुरु'],['♀','Venus','शुक्र'],['♄','Saturn','शनि'],['☊','Rahu','राहु'],['☋','Ketu','केतु']];
export function CosmicHero({lang,onCreate,onExample,busy}:{lang:Lang;onCreate?:()=>void;onExample?:()=>void;busy?:boolean}){
 const t=(en:string,hi:string)=>lang==='hi'?hi:en;
 return <section className="astra-hero" aria-labelledby="astra-hero-title">
  <div className="horizon-art" aria-hidden="true"><div className="horizon-light"/><div className="horizon-rim"/><span className="horizon-star star-a"/><span className="horizon-star star-b"/><span className="horizon-star star-c"/></div>
  <div className="hero-stage">
   <div className="hero-signature"><div className="wordmark-frame" aria-hidden="true"><i/><i/><i/><i/><span>ASTRA</span><div className="wordmark-orbit"/></div><div className="signature-caption"><span className="signature-star">✦</span>{t('INDIAN ASTROLOGY. OPEN TO EVERYONE.','भारतीय ज्योतिष। सभी के लिए मुफ़्त।')}</div></div>
   <div className="hero-story"><div className="hero-badge"><span/> {t('Free Kundali Studio','मुफ़्त कुण्डली स्टूडियो')}</div><h1 id="astra-hero-title">{t('Your Kundali.','आपकी कुण्डली।')}<br/><span>{t('Made clear.','आसान भाषा में।')}</span></h1><p>{t('Start with your birth details. Read your chart, follow your Dasha and understand the connections—in Hindi or English.','अपने जन्म विवरण से शुरुआत करें। कुण्डली पढ़ें, दशा देखें और ग्रह–भाव सम्बन्धों को हिन्दी या English में समझें।')}</p><div className="hero-actions"><a className="hero-primary" href="#birth-details" onClick={onCreate}>{t('Create your Kundali','अपनी कुण्डली बनाएँ')}<ArrowUpRight size={21}/></a><button className="hero-secondary" onClick={onExample} disabled={busy}>{t('Try an example','उदाहरण देखें')}<ArrowUpRight size={21}/></button></div><div className="hero-assurances"><span><ShieldCheck size={14}/>{t('Private. No account needed.','निजी। लॉगिन की ज़रूरत नहीं।')}</span><span><MapPin size={14}/>{t('City, village or PIN','शहर, गाँव या पिन')}</span></div></div>
  </div>
  <div className="graha-ribbon" aria-label={t('Nine grahas included in your chart','कुण्डली के नौ ग्रह')}>{GRAHAS.map(([symbol,en,hi])=><span key={en}><b aria-hidden="true">{symbol}</b>{t(en,hi)}</span>)}</div>
  <div className="hero-footnote"><span>{t('YOUR BIRTH MOMENT. YOUR CHART.','आपका जन्म पल। आपकी कुण्डली।')}</span><a href="#birth-details" onClick={onCreate}>{t('Begin below','नीचे शुरू करें')}<ArrowDown size={14}/></a></div>
 </section>;
}
