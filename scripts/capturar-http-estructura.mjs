import { chromium } from '@playwright/test';
import { readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const dir=resolve('docs/entrega-tp4/03-evidencias/capturas');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1200},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5180');
async function report(title,text,file,note){
  await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><title>TechTask | Evidencia real</title><style>body{margin:40px;background:#f4f6fa;color:#14243f;font:18px Segoe UI,Arial}h1{font-size:30px}p{max-width:1300px;line-height:1.5}pre{background:white;border:1px solid #b8c5d9;border-radius:8px;padding:24px;font:17px/1.5 Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}</style><h1></h1><p></p><pre></pre></html>');
  await page.locator('h1').evaluate((el,v)=>el.textContent=v,title);
  await page.locator('p').evaluate((el,v)=>el.textContent=v,note);
  await page.locator('pre').evaluate((el,v)=>el.textContent=v,text);
  await page.screenshot({path:join(dir,file),fullPage:true});
}
for(const method of ['POST','GET']){
  const body=method==='POST'?{title:'TP de Redes - API',subject:'Redes',priority:'high'}:undefined;
  const result=await page.evaluate(async({method,body})=>{
    const url=new URL('/api/tasks',location.href).href;
    const r=await fetch(url,{method,...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
    return {method,url,status:r.status,statusText:r.statusText,response:await r.json()};
  },{method,body});
  if(result.status!==(method==='POST'?201:200))throw Error('Respuesta HTTP inesperada');
  writeFileSync(join(dir,`api-${method.toLowerCase()}.json`),JSON.stringify({...result,request:body},null,2));
  await report(`TechTask · ${method} /api/tasks`,`${method} ${result.url}\nDestino del proxy: http://127.0.0.1:3001/api/tasks\nHTTP ${result.status} ${result.statusText}\n${body?'\nRequest JSON:\n'+JSON.stringify(body,null,2)+'\n':''}\nResponse JSON:\n${JSON.stringify(result.response,null,2)}`,method==='POST'?'05-api-post.png':'06-api-get.png','Visor de evidencias: respuesta obtenida mediante fetch real desde Edge. Los datos se muestran sin alterar. Esta vista no es DevTools ni forma parte de TechTask.');
  await page.goto('http://127.0.0.1:5180');
}
function tree(path,prefix=''){let lines=[];const entries=readdirSync(path,{withFileTypes:true}).sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name));for(const [i,e] of entries.entries()){const last=i===entries.length-1;lines.push(prefix+(last?'└── ':'├── ')+e.name+(e.isDirectory()?'/':''));if(e.isDirectory())lines.push(...tree(join(path,e.name),prefix+(last?'    ':'│   ')));}return lines;}
const structure=['TechTask/','├── frontend/',...tree(resolve('frontend'),'│   '),'└── backend/',...tree(resolve('backend'),'    ')].join('\n');
writeFileSync(join(dir,'estructura-real.txt'),structure);
await report('TechTask · Estructura real del proyecto',structure,'08-estructura.png','Listado obtenido con readdirSync del sistema de archivos local. Se muestran frontend y backend y sus carpetas reales. Es un visor del listado; no una captura de un IDE ni una terminal.');
await browser.close();
console.log('POST 201, GET 200 y estructura capturados a partir de datos reales.');
