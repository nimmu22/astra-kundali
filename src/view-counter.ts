type Requester=(register:boolean)=>Promise<number>;
export async function requestViewCount(register=false){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await fetch('/api/views',{method:register?'POST':'GET',headers:register?{'X-Astra-View':'1'}:undefined,cache:'no-store',signal:controller.signal});
  if(!response.ok)throw new Error('Counter unavailable');
  const data=await response.json() as {views?:unknown};
  if(typeof data.views!=='number'||!Number.isSafeInteger(data.views)||data.views<0)throw new Error('Invalid count');
  return data.views;
 }finally{clearTimeout(timer);}
}
export function pageViewRegistration(request:Requester){
 let registration:Promise<number>|null=null;
 // A failed write may already have reached the server. Read the total instead
 // of retrying the write and potentially counting the same load twice.
 return ()=>registration??=request(true).catch(()=>request(false));
}
export const registerPageView=pageViewRegistration(requestViewCount);
