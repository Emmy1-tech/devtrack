'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname,'public');
const folder = process.env.DATA_DIR || path.join(__dirname,'data','sessions');
const waits = new Map();
const sessions = new Map();
const fail = (status,message) => Object.assign(new Error(message),{status});
const permitted = {project:['Planning','In progress','Completed'],task:['Todo','In progress','Done'],priority:['Low','Medium','High']};
const text = (v,limit,label,required=false) => {
  if(typeof v!=='string'||v.length>limit||required&&!v.trim())throw fail(400,label+' is invalid');
  return v.trim();
};
const date = value => {
  if(!value||value==='No date')return '';
  if(typeof value!=='string')throw fail(400,'Invalid date');
  if(/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if(new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw fail(400,'Invalid date');
    return value;
  }
  const parsed = new Date(value);
  if(!Number.isFinite(parsed.getTime()))throw fail(400,'Invalid date');
  return parsed.toISOString().slice(0,10);
};
const select = (value,options,label) => {if(!options.includes(value))throw fail(400,'Invalid '+label);return value;};
const uid=()=>crypto.randomUUID();
function seed(){
  return {revision:0,isDemo:true,profile:{name:'Emmy1-tech'},projects:[
    {id:1,name:'Pulse dashboard',description:'Make observability signals easier to understand.',icon:'screen',color:'',owner:'Emmy1-tech',status:'In progress',due:'2026-11-12'},
    {id:2,name:'API redesign',description:'Design documented, consistent REST endpoints.',icon:'code',color:'teal',owner:'Emmy1-tech',status:'In progress',due:'2026-11-18'},
    {id:3,name:'Mobile onboarding',description:'Improve the first experience on smaller screens.',icon:'phone',color:'orange',owner:'Emmy1-tech',status:'Planning',due:'2026-11-25'},
    {id:4,name:'Design system',description:'Document accessible shared UI patterns.',icon:'layers',color:'pink',owner:'Emmy1-tech',status:'Completed',due:'2026-10-22'}
  ],tasks:[
    {id:101,title:'Add API response caching',projectId:2,priority:'High',status:'In progress',due:'2026-11-05',assignee:'Emmy1-tech'},
    {id:102,title:'Review dashboard empty states',projectId:1,priority:'Medium',status:'Todo',due:'2026-10-30',assignee:'Emmy1-tech'},
    {id:103,title:'Write endpoint validation tests',projectId:2,priority:'High',status:'Todo',due:'2026-11-02',assignee:'Emmy1-tech'},
    {id:104,title:'Polish onboarding success screen',projectId:3,priority:'Low',status:'In progress',due:'2026-11-09',assignee:'Emmy1-tech'},
    {id:105,title:'Document spacing tokens',projectId:4,priority:'Medium',status:'Done',due:'2026-10-20',assignee:'Emmy1-tech'},
    {id:106,title:'Add keyboard navigation',projectId:1,priority:'High',status:'Todo',due:'2026-11-04',assignee:'Emmy1-tech'}
  ],activities:[]};
}
function computed(data){
  return {...data,projects:data.projects.map(p=>{
    const list=data.tasks.filter(t=>String(t.projectId)===String(p.id));
    const done=list.filter(t=>t.status==='Done').length;
    return {...p,tasks:list.length,done,progress:list.length?Math.round(done/list.length*100):0};
  })};
}
function normalize(data){
  if(!data||!Array.isArray(data.projects)||!Array.isArray(data.tasks))throw fail(400,'Expected projects and tasks arrays');
  if(data.projects.length>200||data.tasks.length>2000)throw fail(400,'Workspace limit exceeded');
  const projects=data.projects.map(p=>({
    id:String(p.id||uid()),name:text(p.name,80,'Project name',true),
    description:text(p.description||'',240,'Description'),icon:typeof p.icon==='string'?p.icon.slice(0,30):'code',
    color:typeof p.color==='string'?p.color.slice(0,30):'',owner:'Emmy1-tech',
    status:select(p.status||'Planning',permitted.project,'project status'),due:date(p.due)
  }));
  if(new Set(projects.map(p=>p.id)).size!==projects.length)throw fail(400,'Duplicate projects');
  const tasks=data.tasks.map(t=>{
    const projectId=String(t.projectId||'');
    if(!projects.some(p=>p.id===projectId))throw fail(400,'Task has missing project');
    return {id:String(t.id||uid()),projectId,title:text(t.title,120,'Task title',true),
      priority:select(t.priority||'Medium',permitted.priority,'priority'),
      status:select(t.status||'Todo',permitted.task,'task status'),due:date(t.due),
      assignee:text(t.assignee||'Emmy1-tech',80,'Assignee')};
  });
  if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw fail(400,'Duplicate tasks');
  const activities=Array.isArray(data.activities)?data.activities.slice(0,100).map(a=>({
    type:select(a.type||'task',['task','project','milestone'],'activity type'),
    icon:'check',tone:'green',who:text(a.who||'Emmy1-tech',80,'Actor'),
    text:text(a.text||'',120,'Activity text'),target:text(a.target||'',120,'Target'),
    projectId:String(a.projectId||'').slice(0,100),time:typeof a.time==='string'?a.time.slice(0,80):''
  })):[];
  return {revision:Number(data.revision)||0,isDemo:data.isDemo===true,profile:{name:text(data.profile?.name||'Emmy1-tech',80,'Name',true)},projects,tasks,activities};
}
async function read(id){
  try{return JSON.parse(await fs.readFile(path.join(folder,id+'.json'),'utf8'));}
  catch(e){if(e.code==='ENOENT')return seed();throw e;}
}
async function save(id,mutator){
  const prev=waits.get(id)||Promise.resolve();
  const job=prev.catch(()=>{}).then(async()=>{
    const before=await read(id);
    const after=await mutator(structuredClone(before));
    after.revision=before.revision+1;after.updatedAt=new Date().toISOString();
    await fs.mkdir(folder,{recursive:true});
    const tmp=path.join(folder,id+'.'+crypto.randomBytes(4).toString('hex')+'.tmp');
    try{await fs.writeFile(tmp,JSON.stringify(after),{mode:0o600});await fs.rename(tmp,path.join(folder,id+'.json'));}
    finally{await fs.rm(tmp,{force:true}).catch(()=>{});}
    return after;
  });
  waits.set(id,job);
  job.finally(()=>{if(waits.get(id)===job)waits.delete(id);}).catch(()=>{});
  return job;
}
function respond(res,status,body,extra={}){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});
  res.end(JSON.stringify(body));
}
function createServer(){
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Permissions-Policy','camera=(), microphone=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; connect-src 'self'");
    try{
      const url=new URL(req.url,'http://devtrack.invalid');
      if(!url.pathname.startsWith('/api/')){
        if(!['GET','HEAD'].includes(req.method))return respond(res,405,{error:'Method not allowed'});
        if(!['/','/index.html'].includes(url.pathname))return respond(res,404,{error:'Not found'});
        const html=await fs.readFile(path.join(root,'index.html'));
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
        res.end(req.method==='HEAD'?undefined:html);return;
      }
      if(req.headers.origin){
        let origin;try{origin=new URL(req.headers.origin);}catch{throw fail(400,'Invalid Origin');}
        if(origin.host!==req.headers.host)throw fail(403,'Cross-origin access denied');
      }
      let session=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('devtrack_session='))?.split('=')[1];
      if(!/^[a-f0-9]{40}$/.test(session||'')){
        session=crypto.randomBytes(20).toString('hex');
        res.setHeader('Set-Cookie','devtrack_session='+session+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800'+(req.socket.encrypted||req.headers['x-forwarded-proto']==='https'?'; Secure':''));
      }
      const method=req.method,urlPath=url.pathname;
      let body=null;
      if(['PUT','POST','PATCH'].includes(method)){
        if(!(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Expected application/json');
        let raw='';
        for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>300000)throw fail(413,'Payload too large');}
        try{body=JSON.parse(raw);}catch{throw fail(400,'Invalid JSON');}
        if(!body||typeof body!=='object'||Array.isArray(body))throw fail(400,'Expected JSON object');
      }
      if(method==='GET'&&urlPath==='/api/health')return respond(res,200,{status:'ok',application:'DevTrack',storage:'session JSON demo'});
      if(method==='GET'&&urlPath==='/api/workspace')return respond(res,200,computed(await read(session)));
      if(method==='PUT'&&urlPath==='/api/workspace'){
        const output=await save(session,()=>{const state=normalize(body);state.isDemo=false;return state;});
        return respond(res,200,computed(output));
      }
      if(method==='GET'&&urlPath==='/api/projects')return respond(res,200,computed(await read(session)).projects);
      if(method==='GET'&&urlPath==='/api/tasks')return respond(res,200,(await read(session)).tasks);
      if(method==='GET'&&urlPath==='/api/activity')return respond(res,200,(await read(session)).activities);
      if(method==='GET'&&urlPath==='/api/stats'){
        const s=await read(session);const today=new Date().toISOString().slice(0,10);
        const until=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
        return respond(res,200,{projects:s.projects.length,tasks:s.tasks.length,completed:s.tasks.filter(t=>t.status==='Done').length,dueThisWeek:s.tasks.filter(t=>t.status!=='Done'&&t.due>=today&&t.due<until).length});
      }
      if(method==='GET'&&urlPath==='/api/export.csv'){
        const s=await read(session);const csvCell=x=>'"'+String(x||'').replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';
        const lines=[['Project','Task','Priority','Status','Due'],...s.tasks.map(t=>[s.projects.find(p=>String(p.id)===String(t.projectId))?.name,t.title,t.priority,t.status,t.due])].map(a=>a.map(csvCell).join(','));
        res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="devtrack-tasks.csv"'});return res.end(lines.join('\r\n'));
      }
      if(method==='POST'&&urlPath==='/api/reset'){
        const output=await save(session,()=>seed());return respond(res,200,computed(output));
      }
      if(method==='POST'&&['/api/projects','/api/tasks'].includes(urlPath)){
        const collection=urlPath.endsWith('projects')?'projects':'tasks';
        const output=await save(session,current=>{
          const input=collection==='projects'?
            {id:uid(),name:body.name,description:body.description||'',status:body.status||'Planning',due:body.due||'',icon:'code',color:''}:
            {id:uid(),title:body.title,projectId:body.projectId,priority:body.priority||'Medium',status:body.status||'Todo',due:body.due||''};
          current[collection].push(input);current.isDemo=false;return normalize(current);
        });
        return respond(res,201,computed(output));
      }
      const match=urlPath.match(/^\/api\/(projects|tasks)\/([a-zA-Z0-9-]+)$/);
      if(match&&['PATCH','DELETE'].includes(method)){
        const collection=match[1],rid=match[2];
        const output=await save(session,current=>{
          const index=current[collection].findIndex(x=>String(x.id)===rid);
          if(index<0)throw fail(404,'Record not found');
          if(method==='DELETE'){
            current[collection].splice(index,1);
            if(collection==='projects')current.tasks=current.tasks.filter(x=>String(x.projectId)!==rid);
          }else Object.assign(current[collection][index],body);
          current.isDemo=false;return normalize(current);
        });return respond(res,200,computed(output));
      }
      return respond(res,404,{error:'Not found'});
    }catch(e){if(!e.status)console.error('DevTrack API',e);return respond(res,e.status||500,{error:e.status?e.message:'Internal server error'});}
  });
}
if(require.main===module){const port=Number(process.env.PORT)||1295;createServer().listen(port,'0.0.0.0',()=>console.log('DevTrack running on http://localhost:'+port));}
module.exports={createServer,seed,computed,normalize};
