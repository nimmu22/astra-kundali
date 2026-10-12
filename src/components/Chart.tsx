import {memo,useId} from 'react';
import {mod,parts,signName,type ChartResult,type Lang} from '../domain';
import {varga} from '../astro/methods';
export type ChartStyle='north'|'south'|'east';
interface Props {chart:ChartResult;division:number;style:ChartStyle;lang:Lang;onPlanet?:(id:number)=>void;reference?:'ascendant'|'moon'}
const north=[[200,100],[104,45],[44,108],[102,200],[44,294],[104,360],[200,308],[296,360],[357,294],[298,200],[357,108],[296,45]];
const south=[[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0]];
const east=[[200,65],[297,40],[355,108],[332,200],[355,290],[297,353],[200,333],[102,353],[44,290],[65,200],[44,108],[102,40]];
export const Chart=memo(function Chart({chart,division,style,lang,onPlanet,reference='ascendant'}:Props){
 const patternId=useId();
 const asc=reference==='moon'?parts(varga(chart.planets.find(p=>p.id===1)!.longitude,division)).sign:chart.ascendant===null?null:parts(varga(chart.ascendant,division)).sign;
 const planets=chart.planets.map(p=>({...p,sign:parts(varga(p.longitude,division)).sign}));
 const positions=style==='north'?north:style==='east'?east:south.map(([x,y])=>[65+x*90,65+y*90]);
 return <svg className="kundali" viewBox="0 0 400 400" role={onPlanet?'group':'img'} aria-label={`${style} ${reference==='moon'?'Moon':'Ascendant'} D${division} chart; numerical details in planet table`}>
 <defs><pattern id={patternId} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".55" fill="currentColor" opacity=".05"/></pattern></defs>
 <rect x="20" y="20" width="360" height="360" rx="2" className="chart-bg"/><rect x="20" y="20" width="360" height="360" fill={`url(#${patternId})`}/>
 <g className="chart-line" fill="none"><rect x="20" y="20" width="360" height="360" rx="2"/>{style==='north'?<><path d="M20 20L380 380M380 20L20 380"/><path d="M200 20L380 200L200 380L20 200Z"/></>:style==='south'?<>{[110,200,290].map(n=><path key={n} d={`M${n} 20V${n===200?'110':'380'} M${n} 290V380 M20 ${n}H${n===200?'110':'380'} M290 ${n}H380`}/>)}<rect x="110" y="110" width="180" height="180"/></>:<><path d="M140 20V380M260 20V380M20 140H380M20 260H380M20 20L140 140M260 140L380 20M380 380L260 260M140 260L20 380"/></>}</g>
 {positions.map(([x,y],i)=>{const sign=style==='north'?mod((asc??0)+i,12):i;const list=planets.filter(p=>p.sign===sign);return <g key={i}><text x={x} y={y-14} className="sign-label" textAnchor="middle">{sign+1}{asc===sign?(reference==='moon'?' · Mo':' · Asc'):''}</text>{list.map((p,j)=><text key={p.id} x={x+(list.length>2?(j%2===0?-15:15):0)} y={y+2+Math.floor(j/(list.length>2?2:1))*15} className={`chart-planet p-${p.id}`} textAnchor="middle" role={onPlanet?'button':undefined} tabIndex={onPlanet?0:undefined} aria-label={`${p.name} in ${signName(sign,lang)}`} onClick={()=>onPlanet?.(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPlanet?.(p.id);}}}>{p.short}{p.speed<0&&p.id<7?'ᴿ':''}</text>)}</g>;})}
 {style==='south'&&<g textAnchor="middle"><text x="200" y="190" className="chart-center">D{division}</text><text x="200" y="216" className="sign-label">{reference==='moon'?(lang==='hi'?'चन्द्र चक्र':'MOON CHART'):(lang==='hi'?'जन्म चक्र':'SIDEREAL CHART')}</text></g>}
 </svg>;
});
