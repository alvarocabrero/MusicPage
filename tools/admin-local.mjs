/* Servidor local para probar la web y usar la página de administración sin GitHub.
   Uso, desde la carpeta del repositorio (hace falta Node.js 18 o posterior):
     node tools/admin-local.mjs            (o con otro puerto: node tools/admin-local.mjs 8080)
   Después se abre http://localhost:8000 (la web) y http://localhost:8000/admin/ (la administración).
   En este modo la administración no pide clave: lee los archivos de esta carpeta y, al pulsar «Guardar», los escribe
   aquí mismo (datos de js/data/, fotos de img/, portada de index.html y sitemap.xml). Nada se publica: para subirlo,
   se hace commit y push como siempre (ver docs/admin.md).
   Sólo escucha en este ordenador (127.0.0.1) y sólo acepta escrituras desde la propia página. */
import {createServer} from "node:http";
import {readFile,writeFile,mkdir,unlink,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join,extname,dirname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const PORT=+(process.argv[2]||8000);
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".ico":"image/x-icon",".woff2":"font/woff2",".wasm":"application/wasm",".xml":"application/xml",".txt":"text/plain; charset=utf-8",".webmanifest":"application/manifest+json",".md":"text/plain; charset=utf-8"};
/** Archivos que la administración puede escribir o borrar. */
const WRITABLE=p=>/^js\/data\/(releases|videos|merch)\.js$/.test(p)||/^img\/[a-z0-9-]+\.webp$/.test(p)||p==="index.html"||p==="sitemap.xml";
const SKIP=new Set([".git","node_modules"]);

/** Ruta del disco para una ruta del repositorio, sin salir de la carpeta. @param {string} p */
function abs(p){const a=resolve(ROOT,p);if(a!==ROOT&&!a.startsWith(ROOT+sep))throw new Error("ruta no válida");return a}
const sha=b=>createHash("sha1").update(b).digest("hex");

/** Todos los archivos de la carpeta con un resumen de su contenido (para detectar cambios hechos por fuera). */
async function snapshot(dir="",out={}){
 for(const e of await readdir(join(ROOT,dir),{withFileTypes:true})){
  if(SKIP.has(e.name))continue;
  const p=dir?dir+"/"+e.name:e.name;
  if(e.isDirectory())await snapshot(p,out);else if(e.isFile())out[p]=sha(await readFile(join(ROOT,p)));
 }
 return out;
}
/** Estado de la carpeta, con la misma forma que el de GitHub (ver admin/github.js head()). */
async function head(){const files=await snapshot();const s=sha(JSON.stringify(Object.entries(files).sort()));return {sha:s,tree:s,files}}

const send=(res,code,body,type="application/json")=>{res.writeHead(code,{"Content-Type":type,"Cache-Control":"no-store"});res.end(typeof body==="string"||Buffer.isBuffer(body)?body:JSON.stringify(body))};

async function api(req,res,url){
 /* Las escrituras deben venir de esta misma página: una web ajena no puede mandar esta cabecera sin permiso. */
 if(req.method!=="GET"&&req.headers["x-admin-local"]!=="1")return send(res,403,{message:"no permitido"});
 if(url.pathname==="/__admin/head")return send(res,200,await head());
 if(url.pathname==="/__admin/file"){
  try{return send(res,200,await readFile(abs(url.searchParams.get("path"))),"text/plain; charset=utf-8")}catch(e){return send(res,404,{message:"no existe"})}
 }
 if(url.pathname==="/__admin/save"&&req.method==="POST"){
  let raw="";for await(const c of req)raw+=c;
  const {parent,write,remove}=JSON.parse(raw);
  const cur=await head();
  if(cur.sha!==parent)return send(res,422,{message:"Los archivos han cambiado en la carpeta mientras editabas"});
  for(const p of [...Object.keys(write),...remove])if(!WRITABLE(p))return send(res,400,{message:"No se puede escribir "+p});
  for(const [p,v] of Object.entries(write)){await mkdir(dirname(abs(p)),{recursive:true});await writeFile(abs(p),v.base64!=null?Buffer.from(v.base64,"base64"):v.text)}
  for(const p of remove)await unlink(abs(p)).catch(()=>{});
  const files=[...Object.keys(write),...remove];
  console.log("Guardado: "+files.join(", "));
  return send(res,200,{sha:(await head()).sha});
 }
 send(res,404,{message:"no existe"});
}

createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://localhost");
  if(url.pathname.startsWith("/__admin/"))return await api(req,res,url);
  let p=decodeURIComponent(url.pathname).replace(/^\/+/,"");
  if(p===""||p.endsWith("/"))p+="index.html";
  if(p.split("/").some(s=>SKIP.has(s)))return send(res,404,"No existe","text/plain");
  try{const b=await readFile(abs(p));send(res,200,b,TYPES[extname(p)]||"application/octet-stream")}
  catch(e){send(res,404,"No existe","text/plain; charset=utf-8")}
 }catch(e){send(res,500,{message:e.message})}
}).listen(PORT,"127.0.0.1",()=>{
 console.log("Web:            http://localhost:"+PORT+"/");
 console.log("Administración: http://localhost:"+PORT+"/admin/  (modo local: guarda en esta carpeta)");
 console.log("Para pararlo: Ctrl+C");
});
