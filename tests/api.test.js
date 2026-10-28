'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {createServer}=require('../server');
async function boot(t){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'devtrack-ci-'));
 const server=createServer();const old=process.env.DATA_DIR;
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{await new Promise(r=>server.close(r));await fs.rm(dir,{recursive:true,force:true});});
 let cookie='';const url='http://127.0.0.1:'+server.address().port;
 const req=async(p,method='GET',payload)=>{
  const response=await fetch(url+p,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
  if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
  return {code:response.status,value:await response.text(),headers:response.headers};
 };
 return {req,url};
}
test('health and dashboard respond',async t=>{
 const {req}=await boot(t);
 assert.equal((await req('/api/health')).code,200);
 assert.match((await req('/')).value,/DevTrack/);
 assert.equal((await req('/missing')).code,404);
});
test('can load workspace and reject invalid project',async t=>{
 const {req}=await boot(t);const a=await req('/api/workspace');
 assert.equal(JSON.parse(a.value).projects.length,4);
 assert.equal((await req('/api/projects','POST',{name:''})).code,400);
});
test('task creation and completing via API',async t=>{
 const {req}=await boot(t);
 await req('/api/workspace');
 const create=await req('/api/tasks','POST',{title:'Test task',projectId:'1',priority:'High',status:'Todo'});
 assert.equal(create.code,201);
 const data=JSON.parse(create.value);const target=data.tasks.find(x=>x.title==='Test task');
 assert.ok(target);
 const edit=await req('/api/tasks/'+target.id,'PATCH',{status:'Done'});
 assert.equal(edit.code,200);
 assert.equal(JSON.parse(edit.value).tasks.find(x=>x.id===target.id).status,'Done');
});
test('rejects cross-origin writes',async t=>{
 const {url}=await boot(t);
 const r=await fetch(url+'/api/projects',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});
 assert.equal(r.status,403);
});
