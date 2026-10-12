interface Statement {first<T=Record<string,unknown>>():Promise<T|null>}
export interface CounterDatabase {prepare(sql:string):Statement}
export interface WorkerEnv {DB?:CounterDatabase;ASSETS?:{fetch(request:Request):Promise<Response>}}
function json(value:unknown,status=200,extra:Record<string,string>={}){return Response.json(value,{status,headers:{'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff',...extra}});}
export async function counterResponse(request:Request,env:WorkerEnv){
 const url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405,{Allow:'GET, POST'});
 if(request.method==='POST'){
  const origin=request.headers.get('Origin');
  if((origin&&origin!==url.origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'Cross-site writes are not allowed'},403);
  if(request.headers.get('X-Astra-View')!=='1')return json({error:'Invalid page-view request'},400);
 }
 if(!env.DB)return json({error:'View counter unavailable'},503);
 try{
  // An atomic UPSERT avoids losing simultaneous views. Schema belongs to migrations.
  const sql=request.method==='POST'
   ?"INSERT INTO site_views (id,total) VALUES ('global',1) ON CONFLICT(id) DO UPDATE SET total=total+1 RETURNING total"
   :"SELECT total FROM site_views WHERE id='global'";
  const row=await env.DB.prepare(sql).first<{total:number}>();
  const views=row?.total??0;
  if(!Number.isSafeInteger(views)||views<0)throw new Error('Invalid counter value');
  return json({views});
 }catch{return json({error:'View counter temporarily unavailable'},503);}
}
export default {
 async fetch(request:Request,env:WorkerEnv){
  const pathname=new URL(request.url).pathname;
  if(pathname==='/api/views')return counterResponse(request,env);
  if(pathname.startsWith('/api/'))return json({error:'Not found'},404);
  if(env.ASSETS)return env.ASSETS.fetch(request);
  return new Response('Site assets unavailable',{status:503});
 }
};
