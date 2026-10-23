/* Administración en modo local: la misma interfaz que github.js, pero contra tools/admin-local.mjs, que lee y escribe
   los archivos de la carpeta del repositorio en este ordenador. Se usa sola cuando la página se abre desde ese
   servidor (http://localhost:8000/admin/); no hace falta clave. Ver docs/admin.md. */
import {GitHubError} from "./github.js";

/** Petición al servidor local. @param {string} path @param {RequestInit} [opt] @param {boolean} [raw] */
async function call(path,opt={},raw=false){
 const r=await fetch("/__admin/"+path,{...opt,cache:"no-store",headers:{"X-Admin-Local":"1",...(opt.body?{"Content-Type":"application/json"}:{})}});
 if(!r.ok){let m="";try{m=(await r.json()).message}catch(e){}throw new GitHubError(m||r.statusText,r.status)}
 return raw?r.text():r.json();
}

/** ¿Está la página servida por tools/admin-local.mjs? @returns {Promise<boolean>} */
export async function isLocal(){
 if(!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))return false;
 try{const r=await fetch("/__admin/head",{cache:"no-store"});return r.ok&&/json/.test(r.headers.get("content-type")||"")}catch(e){return false}
}

/** Cliente local con la interfaz de github(): check, head, read y publish (que aquí guarda en la carpeta). */
export function local(){
 return {
  async check(){},
  head:()=>call("head"),
  read:path=>call("file?path="+encodeURIComponent(path),{},true),
  async publish({parent,write,remove}){
   const w={};
   for(const [p,v] of Object.entries(write))w[p]=typeof v==="string"?{text:v}:{base64:await base64(v)};
   return (await call("save",{method:"POST",body:JSON.stringify({parent,write:w,remove})})).sha;
  }
 };
}

/** Contenido de un Blob en base64. @param {Blob} b @returns {Promise<string>} */
function base64(b){return new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=()=>ko(r.error);r.readAsDataURL(b)})}
