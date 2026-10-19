/* Administración: acceso al repositorio de la web en GitHub (API REST), con la clave (token) de quien edita.
   Lee los archivos de la rama main y publica todos los cambios de una vez en un único commit (API de Git Data):
   blobs → árbol → commit → mover main. GitHub Pages publica la web sola en 1-2 minutos tras cada commit en main. */

/** Repositorio y rama que publica GitHub Pages. */
export const REPO="alvarocabrero/MusicPage",BRANCH="main";
const API="https://api.github.com/repos/"+REPO;

/** Error de la API con el código HTTP, para dar mensajes claros (401 clave mala, 403/404 sin permiso, 422 conflicto). */
export class GitHubError extends Error{constructor(msg,status){super(msg);this.status=status}}

/**
 * Cliente de la API para una clave concreta.
 * @param {string} token Clave de GitHub (fine-grained con permiso Contents: read and write, o clásica con public_repo).
 */
export function github(token){
 /**
  * Petición a la API. @param {string} path Ruta tras /repos/<repo> @param {RequestInit} [opt]
  * @param {boolean} [raw] Devolver el contenido del archivo en bruto (texto) en vez de JSON.
  */
 async function api(path,opt={},raw=false){
  const r=await fetch(API+path,{...opt,cache:"no-store",headers:{Authorization:"Bearer "+token,Accept:raw?"application/vnd.github.raw+json":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(opt.body?{"Content-Type":"application/json"}:{})}});
  if(!r.ok){let m="";try{m=(await r.json()).message}catch(e){}throw new GitHubError(m||r.statusText,r.status)}
  return raw?r.text():r.json();
 }
 const post=(path,body)=>api(path,{method:"POST",body:JSON.stringify(body)});
 return {
  /** Comprueba la clave y que permite escribir en el repositorio. @returns {Promise<void>} */
  async check(){
   const repo=await api("");
   if(!repo.permissions||!repo.permissions.push)throw new GitHubError("Esta clave no permite publicar en "+REPO,403);
  },
  /**
   * Commit actual de main: su SHA, el de su árbol y el SHA de cada archivo.
   * @returns {Promise<{sha:string,tree:string,files:Object<string,string>}>}
   */
  async head(){
   const ref=await api("/git/ref/heads/"+BRANCH);
   const sha=ref.object.sha;
   const commit=await api("/git/commits/"+sha);
   const tree=await api("/git/trees/"+commit.tree.sha+"?recursive=1");
   const files={};tree.tree.forEach(f=>{if(f.type==="blob")files[f.path]=f.sha});
   return {sha,tree:commit.tree.sha,files};
  },
  /** Contenido de un archivo de texto en un commit. @param {string} path @param {string} ref SHA del commit */
  read:(path,ref)=>api("/contents/"+path.split("/").map(encodeURIComponent).join("/")+"?ref="+ref,{},true),
  /**
   * Publica cambios en un solo commit sobre `parent`. Si main ha avanzado desde entonces, GitHub lo rechaza (422)
   * y no se pierde nada: quien llama vuelve a leer y decide.
   * @param {{parent:string,tree:string,message:string,write:Object<string,string|Blob>,remove:string[]}} c
   *   write: ruta → texto (UTF-8) o Blob (binario); remove: rutas que se borran.
   * @returns {Promise<string>} SHA del commit nuevo.
   */
  async publish({parent,tree,message,write,remove}){
   const entries=[];
   for(const [path,v] of Object.entries(write)){
    const blob=typeof v==="string"?await post("/git/blobs",{content:v,encoding:"utf-8"}):await post("/git/blobs",{content:await base64(v),encoding:"base64"});
    entries.push({path,mode:"100644",type:"blob",sha:blob.sha});
   }
   remove.forEach(path=>entries.push({path,mode:"100644",type:"blob",sha:null}));
   const t=await post("/git/trees",{base_tree:tree,tree:entries});
   const c=await post("/git/commits",{message,tree:t.sha,parents:[parent]});
   await api("/git/refs/heads/"+BRANCH,{method:"PATCH",body:JSON.stringify({sha:c.sha,force:false})});
   return c.sha;
  }
 };
}

/** Contenido de un Blob en base64 (sin el prefijo data:). @param {Blob} b @returns {Promise<string>} */
function base64(b){
 return new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=()=>ko(r.error);r.readAsDataURL(b)});
}
