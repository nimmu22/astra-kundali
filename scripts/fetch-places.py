"""Build attributed offline location packs from the GeoNames cities15000 extract."""
import urllib.request,zipfile,io,json,pathlib
url='https://download.geonames.org/export/dump/cities15000.zip'
data=urllib.request.urlopen(url,timeout=60).read()
z=zipfile.ZipFile(io.BytesIO(data));rows=[]
for line in z.read('cities15000.txt').decode().splitlines():
 f=line.split('\t')
 rows.append(dict(id=f[0],name=f[1],region=f[10],country=f[8],latitude=float(f[4]),longitude=float(f[5]),timezone=f[17]))
root=pathlib.Path('public/data');root.mkdir(parents=True,exist_ok=True)
for name,filtered in [('india',[p for p in rows if p['country']=='IN']),('world',rows)]:
 (root/(name+'.json')).write_text(json.dumps(filtered,ensure_ascii=False,separators=(',',':')))
(root/'attribution.json').write_text(json.dumps(dict(source=url,licence='CC-BY',credit='GeoNames — https://www.geonames.org/',coverage='Populated places over 15,000 people; manual input supports other locations',places=len(rows))))
print('GeoNames locations:',len(rows))
