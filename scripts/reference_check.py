"""Cross-check browser WASM output with Python Swiss Ephemeris 2.10.03.
Shared underlying engine: this detects integration errors, not independent accuracy.
pip install pyswisseph==2.10.3.2. Generated cases are synthetic, not classical examples.
"""
import json,math,datetime,pathlib
import swisseph as swe
root=pathlib.Path('tests/fixtures');data=json.loads((root/'numerical-cases.json').read_text())
assert swe.version=='2.10.03',swe.version
angular=lambda a,b:abs((a-b+180)%360-180)
maxima=dict(planetDegrees=0,speedDegreesPerDay=0,ascendantDegrees=0,cuspDegrees=0,ayanamshaDegrees=0,sunEventSeconds=0,panchangEndSeconds=0)
for c in data['charts']:
 swe.set_sid_mode(c['profile']['ayanamsha']);jd=c['jd'];a=swe.get_ayanamsa_ex_ut(jd,4)[1]
 maxima['ayanamshaDegrees']=max(maxima['ayanamshaDegrees'],angular(a,c['ayanamsa']))
 place=c['input']['place'];cu,axes=swe.houses_ex(jd,place['latitude'],place['longitude'],b'W',swe.FLG_SIDEREAL)
 maxima['ascendantDegrees']=max(maxima['ascendantDegrees'],angular(axes[0],c['ascendant']))
 kp,_=swe.houses_ex(jd,place['latitude'],place['longitude'],b'P')
 for x,y in zip(kp,c['cusps']):maxima['cuspDegrees']=max(maxima['cuspDegrees'],angular((x-a)%360,y))
 for p in c['planets']:
  body=p['id'] if p['id']<7 else (swe.MEAN_NODE if c['profile']['nodes']=='mean' else swe.TRUE_NODE)
  val,flags=swe.calc_ut(jd,body,4|256|65536);assert flags&7==4
  lon=(val[0]+(180 if p['id']==11 else 0))%360
  maxima['planetDegrees']=max(maxima['planetDegrees'],angular(lon,p['longitude']))
  maxima['speedDegreesPerDay']=max(maxima['speedDegreesPerDay'],abs(val[3]-p['speed']))
for d in data['days']:
 swe.set_sid_mode(d['profile']['ayanamsha']);place=d['place'];jd=d['jd'];geo=(place['longitude'],place['latitude'],0)
 # A start before the local sunrise brackets the same civil-day event.
 for kind,key in [(swe.CALC_RISE,'sunrise'),(swe.CALC_SET,'sunset')]:
  found,t=swe.rise_trans(d['dayStart']/86400000+2440587.5,swe.SUN,kind|swe.BIT_HINDU_RISING,geo,0,0,4);assert found==0
  seconds=abs(t[0]-(d[key]/86400000+2440587.5))*86400
  maxima['sunEventSeconds']=max(maxima['sunEventSeconds'],seconds)
 def phase(t,kind):
  sun=swe.calc_ut(t,0,4|256|65536)[0][0];moon=swe.calc_ut(t,1,4|256|65536)[0][0]
  return (moon if kind==1 else sun+moon if kind==2 else moon-sun)%360
 for idx,(kind,width) in enumerate([(0,12),(1,40/3),(2,40/3),(0,6)]):
  initial=phase(jd,kind);assert math.floor(initial/width)==d['events'][idx]['index']
  target=(math.floor(initial/width)+1)*width
  # Separate bracket: two-hour interval sampling, Brent-free bisection.
  residual=lambda t:((phase(t,kind)-initial)%360)-(target-initial)
  lo=jd;hi=jd+1/12
  while residual(hi)<0:lo=hi;hi+=1/12
  for _ in range(45):
   mid=(lo+hi)/2
   if residual(mid)<0:lo=mid
   else:hi=mid
  seconds=abs((lo+hi)/2-(d['events'][idx]['end']/86400000+2440587.5))*86400
  maxima['panchangEndSeconds']=max(maxima['panchangEndSeconds'],seconds)
assert all(maxima[k]<1e-6 for k in ['planetDegrees','ascendantDegrees','cuspDegrees','ayanamshaDegrees']),maxima
assert maxima['speedDegreesPerDay']<1e-6,maxima
assert maxima['sunEventSeconds']<2,maxima
assert maxima['panchangEndSeconds']<0.1,maxima
summary=dict(status='passed',birthCases=len(data['charts']),panchangDays=len(data['days']),reference='pyswisseph 2.10.3.2 / Swiss Ephemeris 2.10.03',maxDifferences=maxima,limitations=['Shared Swiss Ephemeris core, not independent astronomical certification','Synthetic cases; no claim of classical-method certification','Browser, service worker and print-dialog QA not executed'])
(root/'numerical-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
