"""Reproducible prefix/PIN shards; no population cut-off. GeoNames CC BY 4.0.
Pass directory containing gazetteer.zip, postal.zip, admin1.txt and admin2.txt.
Aliases are preserved; historic/abandoned/destroyed features excluded.
"""
import pathlib,zipfile,json,sys,unicodedata,collections,hashlib
source=pathlib.Path(sys.argv[1]);out=pathlib.Path('public/locations');out.mkdir(exist_ok=True)
def norm(s):return ' '.join(''.join(c for c in unicodedata.normalize('NFD',s.lower()) if not unicodedata.category(c).startswith('M')).split())
def key(s):return '-'.join(format(ord(c),'x') for c in norm(s)[:2])
def dump(path,v):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(v,ensure_ascii=False,separators=(',',':')))
admin1={};admin2={}
for f,mapping in [('admin1.txt',admin1),('admin2.txt',admin2)]:
 for line in (source/f).read_text().splitlines():
  a=line.split('\t')
  if a[0].startswith('IN.'):mapping[a[0]]=a[1]
shards=collections.defaultdict(list);count=0
with zipfile.ZipFile(source/'gazetteer.zip') as z:
 for raw in z.read('IN.txt').decode().splitlines():
  a=raw.split('\t')
  if a[6]!='P' or a[7] in ['PPLQ','PPLH','PPLW']:continue
  state=admin1.get('IN.'+a[10],a[10]);district=admin2.get('IN.'+a[10]+'.'+a[11],a[11])
  aliases=[n for n in [a[1],a[2],*a[3].split(',')] if n];search='|'.join(dict.fromkeys(norm(n) for n in aliases))
  row=[a[0],a[1],state,district,float(a[4]),float(a[5]),a[17] or 'Asia/Kolkata',search,a[7]]
  keys={key(n) for n in aliases if len(norm(n))>=2}
  for k in keys:shards[k].append(row)
  count+=1
for stale in (out/'names').glob('*.json'):
 if stale.stem not in shards:stale.unlink()
for k,rows in shards.items():dump(out/'names'/f'{k}.json',rows)
pins=collections.defaultdict(dict);postalcount=0
with zipfile.ZipFile(source/'postal.zip') as z:
 for i,raw in enumerate(z.read('IN.txt').decode().splitlines()):
  a=raw.split('\t')
  if len(a)<12 or len(a[1])!=6:continue
  row=[f'pin-{i}',a[2],a[3],a[5],float(a[9]),float(a[10]),a[1],int(a[11] or 0)]
  pins[a[1][:3]].setdefault(a[1],[]).append(row);postalcount+=1
for k,rows in pins.items():dump(out/'pins'/f'{k}.json',rows)
meta={'schemaVersion':1,'settlements':count,'postalLocations':postalcount,'pincodes':sum(len(p) for p in pins.values()),'nameKeys':sorted(shards),'pinPrefixes':sorted(pins),'states':sorted(set(admin1.values())),'retrieved':'2026-10-11','source':'GeoNames','licence':'CC BY 4.0','gazetteerURL':'https://download.geonames.org/export/dump/IN.zip','postalURL':'https://download.geonames.org/export/zip/IN.zip','coverage':'All active class-P records in this snapshot, no population threshold. Not a certification of every Indian village. PIN coordinates are estimated, not exact birth addresses.','hashes':{f:hashlib.sha256((source/f).read_bytes()).hexdigest() for f in ['gazetteer.zip','postal.zip']}}
dump(out/'manifest.json',meta)
for f in ['gazetteer-readme.txt','postal-readme.txt']:
 if (source/f).exists():(out/f).write_bytes((source/f).read_bytes())
print({k:meta[k] for k in ['settlements','postalLocations','pincodes']});print('name shards',len(shards),'postal shards',len(pins))
