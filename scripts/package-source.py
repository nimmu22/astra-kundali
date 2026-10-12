"""Deterministic source package. Explicit allowlist excludes checkout credentials."""
import pathlib,tarfile,lzma
root=pathlib.Path('.');files=[]
for folder in ['src','public','scripts','tests','docs','vendor']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
for name in ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','tsconfig.json','vite.config.ts','index.html','LICENSE','NOTICE.md','README.md','.gitignore','.openai/hosting.json']:
 p=root/name
 if p.exists():files.append(p)
pathlib.Path('dist').mkdir(exist_ok=True)
with open('dist/source.tar.xz','wb') as dest:
 with lzma.LZMAFile(dest,mode='wb',preset=9) as compressed:
  with tarfile.open(fileobj=compressed,mode='w') as archive:
   for p in sorted(files):
    entry=archive.gettarinfo(str(p),arcname=str(p));entry.mtime=1791676800;entry.uid=entry.gid=0;entry.uname=entry.gname='';entry.mode=0o644
    with p.open('rb') as content:archive.addfile(entry,content)
print('Source files packaged:',len(files))
