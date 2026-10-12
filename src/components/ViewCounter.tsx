import {useEffect,useState} from 'react';
import {Eye} from 'lucide-react';
import type {Lang} from '../domain';

import {registerPageView,requestViewCount} from '../view-counter';

export function ViewCounter({lang}:{lang:Lang}){
 const [views,setViews]=useState<number|null>(null),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  let active=true;
  const update=(n:number)=>{if(active){setViews(n);setUnavailable(false);}},failed=()=>{if(active)setUnavailable(true);};
  registerPageView().then(update).catch(failed);
  const refresh=()=>{if(document.visibilityState==='visible')requestViewCount().then(update).catch(failed);};
  const timer=window.setInterval(refresh,30000);
  document.addEventListener('visibilitychange',refresh);
  window.addEventListener('online',refresh);
  return()=>{active=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('online',refresh);};
 },[]);
 const t=(en:string,hi:string)=>lang==='hi'?hi:en;
 return <div className="view-counter" title={unavailable?t('Live count unavailable; showing the last received value if any.','लाइव गिनती उपलब्ध नहीं; उपलब्ध होने पर आख़िरी मान दिखता है।'):t('Total online page views, including refreshes; not unique visitors.','कुल ऑनलाइन पेज व्यूज़, रीफ़्रेश सहित; अलग-अलग लोगों की गिनती नहीं है।')} aria-label={`${t('Page views','पेज व्यूज़')}: ${views===null?t(unavailable?'unavailable':'loading',unavailable?'अनुपलब्ध':'लोड हो रहा है'):new Intl.NumberFormat(lang==='hi'?'hi-IN':'en-IN').format(views)}`}><Eye size={14} aria-hidden="true"/><span>{t('Views','व्यूज़')}</span><strong>{views===null?'—':new Intl.NumberFormat(lang==='hi'?'hi-IN':'en-IN').format(views)}</strong>{unavailable&&<i aria-hidden="true">·</i>}</div>;
}
