/* Página de administración: editar lanzamientos, videoclips y merch y publicarlos en la web.
   Flujo: entrar con una clave de GitHub → se leen de la rama main los datos (js/data/*.js) e index.html → se edita
   una copia de trabajo (nada sale del navegador hasta publicar) → "Vista previa" muestra la web completa con los
   cambios → "Publicar" lo sube todo en un solo commit: datos, fotos nuevas (ya en WebP), fotos que ya no se usan
   (se borran) y la portada de index.html si cambia el último lanzamiento. Detalles: docs/admin.md. */
import {github,GitHubError,REPO} from "./github.js";
import {prepareImage} from "./images.js";
import {heroHTML} from "../js/views/releaseView.js";
import {setLang} from "../js/models/i18n.js";

/** Archivo de datos de cada sección. */
const FILES={releases:"js/data/releases.js",videos:"js/data/videos.js",merch:"js/data/merch.js"};
/** Nombres de las secciones (para mensajes y resúmenes). */
const NAMES={releases:"Lanzamientos",videos:"Videoclips",merch:"Merch"};
/** Ayuda que se muestra encima de la lista de cada sección. */
const HINTS={
 releases:"El primero es el «Último lanzamiento» de la portada. Ordénalos con ↑ ↓, del más reciente al más antiguo.",
 videos:"La web los ordena sola por fecha, del más reciente al más antiguo.",
 merch:"Aparecen en la web en este orden; cámbialo con ↑ ↓."
};
const KINDS={album:"Álbum",ep:"EP"},MKINDS={cd:"CD",vinyl:"Vinilo",shirt:"Camiseta"};
/** Plataformas de los discos (Spotify sale del ID de Spotify). */
const LINKS=[["bandcamp","Bandcamp"],["yt","YouTube"],["apple","Apple Music"],["ytm","YouTube Music"],["tidal","Tidal"]];
const TOKEN="admin.token";

const $=id=>document.getElementById(id);
/** Texto seguro dentro de HTML. @param {*} s */
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* ---------- Estado ---------- */
let gh;                 /* cliente de GitHub */
let base;               /* commit de main sobre el que se edita: {sha, tree, files: {ruta: sha}} */
const src={};           /* texto original de cada archivo de datos */
const orig={},work={};  /* datos publicados y copia de trabajo, por sección */
let indexHtml="";       /* index.html publicado */
let sitemap="";         /* sitemap.xml publicado (su <lastmod> se pone al día al publicar) */
const pending=new Map();/* fotos nuevas sin publicar: ruta → {blob, url} */
const recent=new Map(); /* fotos recién publicadas (la web aún puede no tenerlas): ruta → url local */
let tab="releases";

/* ---------- Datos ---------- */
/** Datos de un archivo js/data/*.js: el JSON que sigue a "export default". @param {string} text */
function parse(text){
 const i=text.indexOf("export default ");
 if(i<0)throw new Error("Formato inesperado en un archivo de datos");
 return JSON.parse(text.slice(i+15,text.lastIndexOf(";")));
}
/** Texto del archivo de una sección con datos nuevos (se conserva el comentario de cabecera). */
function serialize(s,data){const i=src[s].indexOf("export default ");return src[s].slice(0,i+15)+JSON.stringify(data,null,1)+";\n"}

/** Fotos (rutas img/…) que usa un elemento. */
function imagesOf(s,x){return s==="releases"?["img/"+x.img+".webp"]:s==="merch"?x.imgs.slice():[]}
/** Todas las fotos que usan unos datos. @param {Object} data {releases, videos, merch} */
function allImages(data){const set=new Set();for(const s in FILES)(data[s]||[]).forEach(x=>imagesOf(s,x).forEach(p=>set.add(p)));return set}
/** Dirección para mostrar una foto: la nueva sin publicar, la recién publicada o la de la web. */
const imgSrc=p=>(pending.get(p)||{}).url||recent.get(p)||"../"+p;

/** Nombre de archivo a partir de un texto: "Taiga & Cazador" → "taiga-cazador". */
const slug=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"foto";
/** ¿Está ocupada esta ruta (en el repositorio, en fotos nuevas o en los datos)? */
const taken=p=>!!base.files[p]||pending.has(p)||allImages(work).has(p);
/** Primera ruta libre con ese nombre: img/nombre.webp, img/nombre-2.webp… o, numerada (fotos de merch),
 *  img/nombre-1.webp, img/nombre-2.webp… */
function freePath(name,numbered){let n=numbered?1:2,p=numbered?"img/"+name+"-1.webp":"img/"+name+".webp";while(taken(p))p="img/"+name+"-"+ ++n+".webp";return p}

/** Título que identifica un elemento en listas y resúmenes. */
const titleOf=(s,x)=>s==="merch"?x.t.es:x.t;

/* ---------- Entrada ---------- */
function getToken(){try{return localStorage.getItem(TOKEN)||sessionStorage.getItem(TOKEN)}catch(e){return null}}
function setToken(t,remember){try{localStorage.removeItem(TOKEN);sessionStorage.removeItem(TOKEN);if(t)(remember?localStorage:sessionStorage).setItem(TOKEN,t)}catch(e){}}

function showLogin(msg){$("app").hidden=$("bar").hidden=$("salir").hidden=true;$("login").hidden=false;$("loginerr").textContent=msg||""}

/** Mensaje claro para los errores de GitHub. @param {Error} e */
function explain(e){
 if(e instanceof TypeError)return "No se puede conectar con GitHub. Comprueba la conexión a internet y vuelve a intentarlo.";
 if(!(e instanceof GitHubError))return e.message||String(e);
 if(e.status===401)return "La clave no es válida o ha caducado. Crea una nueva.";
 if(e.status===403||e.status===404)return "Esta clave no tiene permiso para publicar en "+REPO+" (necesita Contents: Read and write).";
 return "GitHub ha respondido: "+e.message;
}

async function start(token){
 gh=github(token);
 $("login").hidden=true;$("app").hidden=false;$("list").innerHTML='<li class="cargando">Cargando…</li>';
 await gh.check();
 await load();
 $("salir").hidden=false;
 render();
}

/** Lee de main los datos de las tres secciones e index.html y empieza una copia de trabajo nueva. */
async function load(){
 base=await gh.head();
 const names=Object.keys(FILES);
 const texts=await Promise.all(names.map(s=>gh.read(FILES[s],base.sha)));
 names.forEach((s,i)=>{src[s]=texts[i];orig[s]=parse(texts[i]);work[s]=clone(orig[s])});
 [indexHtml,sitemap]=await Promise.all([gh.read("index.html",base.sha),gh.read("sitemap.xml",base.sha)]);
 pending.forEach(v=>URL.revokeObjectURL(v.url));pending.clear();
}

/* ---------- Lista ---------- */
function render(){
 document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===tab)));
 $("hint").textContent=HINTS[tab];
 const items=work[tab].map((x,i)=>({x,i}));
 if(tab==="videos")items.sort((a,b)=>b.x.d.localeCompare(a.x.d));
 const origJson=new Set(orig[tab].map(x=>JSON.stringify(x)));
 $("list").innerHTML=items.map(({x,i},pos)=>{
  const changed=!origJson.has(JSON.stringify(x))||imagesOf(tab,x).some(p=>pending.has(p));
  const thumb=tab==="videos"?"https://i.ytimg.com/vi/"+x.id+"/mqdefault.jpg":imgSrc(imagesOf(tab,x)[0]);
  const sub=tab==="releases"?[].concat(x.a).join(", ")+" · "+KINDS[x.k]+" · "+x.y:tab==="videos"?x.d.split("-").reverse().join("/"):MKINDS[x.k]+" · "+x.p.es;
  const move=tab==="videos"?"":'<button class="mini" data-act="up" data-i="'+i+'" aria-label="Subir" '+(pos===0?"disabled":"")+'>↑</button><button class="mini" data-act="down" data-i="'+i+'" aria-label="Bajar" '+(pos===items.length-1?"disabled":"")+'>↓</button>';
  return '<li class="item'+(tab==="videos"?" video":"")+(changed?" cambiado":"")+'"><img src="'+esc(thumb)+'" alt="" loading="lazy"><div class="txt"><b>'+esc(titleOf(tab,x))+(tab==="releases"&&pos===0?" · <small>portada</small>":"")+'</b><span>'+esc(sub)+(changed?" · sin publicar":"")+'</span></div><div class="acc">'+move+'<button class="mini edit" data-act="edit" data-i="'+i+'">Editar</button><button class="mini del" data-act="del" data-i="'+i+'" aria-label="Borrar">✕</button></div></li>';
 }).join("")||'<li class="cargando">No hay nada todavía.</li>';
 updateBar();
}

function updateBar(){
 const ch=changes();
 $("bar").hidden=!ch.length;
 $("cambios").textContent=ch.length===1?"1 cambio sin publicar":ch.length+" cambios sin publicar";
}

/** Resumen de los cambios de la copia de trabajo respecto a lo publicado. @returns {string[]} */
function changes(){
 const out=[];
 for(const s in FILES){
  if(!orig[s])continue;
  const before=orig[s].map(x=>titleOf(s,x)),after=work[s].map(x=>titleOf(s,x));
  work[s].forEach(x=>{
   const t=titleOf(s,x),o=orig[s].find(y=>titleOf(s,y)===t);
   if(!o)out.push(NAMES[s]+": nuevo «"+t+"»");
   else if(!same(o,x)||imagesOf(s,x).some(p=>pending.has(p)))out.push(NAMES[s]+": cambios en «"+t+"»");
  });
  orig[s].forEach(x=>{const t=titleOf(s,x);if(!after.includes(t))out.push(NAMES[s]+": borrado «"+t+"»")});
  if(s!=="videos"){const a=before.filter(t=>after.includes(t)),b=after.filter(t=>before.includes(t));if(!same(a,b))out.push(NAMES[s]+": nuevo orden")}
 }
 return out;
}

$("list").addEventListener("click",e=>{
 const b=e.target.closest("button[data-act]");if(!b)return;
 const i=+b.dataset.i,list=work[tab];
 if(b.dataset.act==="up"&&i>0)[list[i-1],list[i]]=[list[i],list[i-1]];
 else if(b.dataset.act==="down"&&i<list.length-1)[list[i+1],list[i]]=[list[i],list[i+1]];
 else if(b.dataset.act==="del"){if(!confirm("¿Borrar «"+titleOf(tab,list[i])+"»? (No se borra de la web hasta que publiques.)"))return;list.splice(i,1)}
 else if(b.dataset.act==="edit")return openEditor(i);
 render();
});
document.querySelector(".tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b){tab=b.dataset.tab;render()}});
$("add").addEventListener("click",()=>openEditor(-1));

/* ---------- Formularios ---------- */
/** Campo de texto. */
const field=(name,label,value,o={})=>'<label>'+label+(o.help?'<small>'+o.help+'</small>':'')+'<'+(o.area?'textarea':'input type="'+(o.type||"text")+'"')+' name="'+name+'"'+(o.area?'':' value="'+esc(value)+'"')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(o.req?' required':'')+(o.attrs||'')+'>'+(o.area?esc(value)+'</textarea>':'')+'</label>';
const select=(name,label,opts,value)=>'<label>'+label+'<select name="'+name+'">'+Object.entries(opts).map(([k,v])=>'<option value="'+k+'"'+(k===value?' selected':'')+'>'+esc(v)+'</option>').join("")+'</select></label>';

let ed=null; /* formulario abierto: {i, fotos…} */

function openEditor(i){
 const x=i<0?null:work[tab][i];
 ed={i,x,cover:null,photos:x&&tab==="merch"?x.imgs.map(p=>({path:p})):[]};
 $("edtitle").textContent=(i<0?"Añadir":"Editar")+" · "+NAMES[tab];
 $("ederr").textContent="";
 $("edbody").innerHTML=tab==="releases"?releaseForm(x):tab==="videos"?videoForm(x):merchForm(x);
 if(tab==="merch")drawPhotos();
 if(tab==="videos")videoThumb();
 $("editor").showModal();
 $("edbody").scrollTop=0;
}

function releaseForm(r){
 r=r||{t:"",a:"Arte Kills",k:"album",y:String(new Date().getFullYear()),n:"",links:{}};
 const cover=r.img?imgSrc("img/"+r.img+".webp"):"";
 return '<div class="fotos portada"><div class="foto">'+(cover?'<img id="covimg" src="'+esc(cover)+'" alt="Portada">':'<img id="covimg" alt="" hidden>')+'</div></div>'+
  '<label class="subir">'+(r.img?"Cambiar portada":"Portada")+'<small>Cuadrada; se recorta al centro y se guarda a 1200 × 1200.</small><input type="file" name="cover" accept="image/*"></label>'+
  field("t","Título",r.t,{req:true})+
  field("a","Artistas",[].concat(r.a).join(", "),{req:true,help:"Separados por comas, en orden de crédito: «Arte Kills, Silver J»."})+
  '<div class="dos">'+select("k","Tipo",KINDS,r.k)+field("y","Año",r.y,{req:true,type:"text",attrs:' inputmode="numeric" maxlength="4"'})+'</div>'+
  field("n","Canciones",r.n&&typeof r.n==="object"?r.n.es:r.n,{req:true,help:"Un número, o un texto corto si no aplica.",attrs:' inputmode="numeric"'})+
  field("sp","Spotify",r.sp?"https://open.spotify.com/album/"+r.sp:"",{help:"Enlace del álbum en Spotify (activa la preescucha).",ph:"https://open.spotify.com/album/…"})+
  '<fieldset><legend>Enlaces</legend>'+LINKS.map(([k,n])=>field("l_"+k,n,(r.links||{})[k]||"",{ph:"https://…",type:"url"})).join("")+'</fieldset>';
}

function videoForm(v){
 v=v||{id:"",t:"",d:new Date().toISOString().slice(0,10)};
 return field("id","Vídeo de YouTube",v.id?"https://www.youtube.com/watch?v="+v.id:"",{req:true,help:"Enlace del vídeo (o su ID).",ph:"https://www.youtube.com/watch?v=…"})+
  '<img class="thumbv" id="vthumb" alt="">'+
  field("t","Título",v.t,{req:true,help:"Sin añadidos como «(visualizer)»."})+
  field("d","Fecha de publicación",v.d,{req:true,type:"date",help:"Sirve para ordenarlos."});
}

function merchForm(m){
 m=m||{k:"cd",t:{es:"",en:""},p:{es:"",en:""},d:{es:"",en:""},url:"",cta:"cta.instagram",imgs:[]};
 const d=m.d||{};
 return '<p><b>Fotos</b> <small>(la primera es la principal; se guardan a 900 px por el lado corto)</small></p><div class="fotos" id="fotos"></div>'+
  '<label class="subir">Añadir fotos<input type="file" name="photos" accept="image/*" multiple></label>'+
  select("k","Tipo",MKINDS,m.k)+
  '<fieldset><legend>Nombre</legend><div class="dos">'+field("t_es","Español",m.t.es,{req:true})+field("t_en","Inglés",m.t.en||"")+'</div></fieldset>'+
  '<fieldset><legend>Precio</legend><div class="dos">'+field("p_es","Español",m.p.es,{req:true,ph:"10 € + gastos de envío"})+field("p_en","Inglés",m.p.en||"",{ph:"€10 + shipping"})+'</div></fieldset>'+
  '<fieldset><legend>Descripción</legend>'+field("d_es","Español",d.es||"",{area:true})+field("d_en","Inglés",d.en||"",{area:true})+'</fieldset>'+
  field("url","Enlace de compra",m.url||"",{type:"url",ph:"https://…",help:"Sin enlace, el producto no tiene botón."})+
  select("cta","Texto del botón",{"":"Comprar","cta.instagram":"Pedir por Instagram"},m.cta||"")+
  '<p><small>Si dejas vacío el inglés, se muestra el español.</small></p>';
}

/** Fotos del producto en el formulario, con botones para ordenar y quitar. */
function drawPhotos(){
 $("fotos").innerHTML=ed.photos.map((f,i)=>'<div class="foto"><img src="'+esc(f.url||imgSrc(f.path))+'" alt="Foto '+(i+1)+'">'+(f.blob?'<span class="nueva">NUEVA</span>':'')+'<div><button type="button" class="mini" data-f="up" data-i="'+i+'" aria-label="Antes" '+(i?'':'disabled')+'>←</button><button type="button" class="mini" data-f="down" data-i="'+i+'" aria-label="Después" '+(i<ed.photos.length-1?'':'disabled')+'>→</button><button type="button" class="mini del" data-f="del" data-i="'+i+'" aria-label="Quitar">✕</button></div></div>').join("")||'<small>Sin fotos todavía.</small>';
}

/** Miniatura del vídeo según el enlace escrito. */
function videoThumb(){const id=ytId($("edform").elements.id.value);const im=$("vthumb");im.hidden=!id;if(id)im.src="https://i.ytimg.com/vi/"+id+"/hqdefault.jpg"}

const ytId=s=>{s=String(s).trim();const m=s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);return m?m[1]:/^[\w-]{11}$/.test(s)?s:""};
const spId=s=>{s=String(s).trim();if(!s)return "";const m=s.match(/album\/([A-Za-z0-9]{22})/);return m?m[1]:/^[A-Za-z0-9]{22}$/.test(s)?s:null};

$("edbody").addEventListener("click",e=>{
 const b=e.target.closest("button[data-f]");if(!b)return;
 const i=+b.dataset.i,p=ed.photos;
 if(b.dataset.f==="up")[p[i-1],p[i]]=[p[i],p[i-1]];
 else if(b.dataset.f==="down")[p[i+1],p[i]]=[p[i],p[i+1]];
 else p.splice(i,1);
 drawPhotos();
});
$("edbody").addEventListener("input",e=>{if(e.target.name==="id")videoThumb()});
$("edbody").addEventListener("change",async e=>{
 const inp=e.target;if(inp.type!=="file"||!inp.files.length)return;
 $("ederr").textContent="Preparando fotos…";
 try{
  if(inp.name==="cover"){
   const r=await prepareImage(inp.files[0],{square:true,size:1200});
   if(ed.cover)URL.revokeObjectURL(ed.cover.url);
   ed.cover={blob:r.blob,url:URL.createObjectURL(r.blob)};
   const im=$("covimg");im.src=ed.cover.url;im.hidden=false;
   $("ederr").textContent=r.width<1200?"Aviso: la portada mide "+r.width+" px; se verá algo borrosa en pantallas grandes (mejor 1200 px o más).":"";
  }else{
   for(const f of inp.files){const r=await prepareImage(f,{size:900});ed.photos.push({blob:r.blob,url:URL.createObjectURL(r.blob)})}
   drawPhotos();$("ederr").textContent="";
  }
 }catch(err){$("ederr").textContent=err.message}
 inp.value="";
});

/** Comprueba un texto que la web inserta en el HTML: no puede llevar < > ni comillas dobles. */
function text(v,label,req){
 v=String(v||"").trim();
 if(req&&!v)throw new Error("Falta: "+label+".");
 if(/[<>"]/.test(v))throw new Error(label+": no puede llevar < > ni comillas dobles (usa « » o “ ”).");
 return v;
}
function url(v,label){v=String(v||"").trim();if(v&&!/^https:\/\/[^\s"<>]+$/.test(v))throw new Error(label+": tiene que ser un enlace que empiece por https://");return v}

$("edform").addEventListener("submit",e=>{
 e.preventDefault();
 try{save();$("editor").close();render()}
 catch(err){$("ederr").textContent=err.message}
});
const closeEd=()=>$("editor").close();
$("edx").addEventListener("click",closeEd);$("edcancel").addEventListener("click",closeEd);

/** Valida el formulario y aplica el cambio a la copia de trabajo (lanza Error con el mensaje si algo falla). */
function save(){
 const f=$("edform").elements,list=work[tab],x=ed.x?clone(ed.x):{};
 if(tab==="releases"){
  x.t=text(f.t.value,"Título",true);
  const a=text(f.a.value,"Artistas",true).split(",").map(s=>s.trim()).filter(Boolean);
  x.a=a.length>1?a:a[0];
  x.k=f.k.value;
  x.y=text(f.y.value,"Año",true);if(!/^\d{4}$/.test(x.y))throw new Error("Año: cuatro cifras, p. ej. 2026.");
  const n=text(f.n.value,"Canciones",true);x.n=/^\d+$/.test(n)?+n:n;
  const sp=spId(f.sp.value);if(sp===null)throw new Error("Spotify: pega el enlace del álbum (https://open.spotify.com/album/…).");
  if(sp)x.sp=sp;else delete x.sp;
  x.links=Object.assign({},x.links);
  LINKS.forEach(([k,n])=>{const v=url(f["l_"+k].value,n);if(v)x.links[k]=v;else delete x.links[k]});
  if(list.some((r,i)=>i!==ed.i&&r.t===x.t))throw new Error("Ya hay un disco con ese título.");
  if(!x.img){
   if(!ed.cover)throw new Error("Falta la portada.");
   x.img=freePath(slug(x.t)).slice(4,-5);
  }
  if(ed.cover)setPending("img/"+x.img+".webp",ed.cover);
 }else if(tab==="videos"){
  x.id=ytId(f.id.value);if(!x.id)throw new Error("Vídeo: pega el enlace de YouTube (https://www.youtube.com/watch?v=…).");
  x.t=text(f.t.value,"Título",true);
  x.d=f.d.value;if(!/^\d{4}-\d{2}-\d{2}$/.test(x.d))throw new Error("Falta la fecha.");
  if(list.some((v,i)=>i!==ed.i&&v.id===x.id))throw new Error("Ese vídeo ya está en la lista.");
 }else{
  x.k=f.k.value;
  x.t={es:text(f.t_es.value,"Nombre (español)",true)};const ten=text(f.t_en.value,"Nombre (inglés)");if(ten)x.t.en=ten;
  x.p={es:text(f.p_es.value,"Precio (español)",true)};const pen=text(f.p_en.value,"Precio (inglés)");if(pen)x.p.en=pen;
  const des=text(f.d_es.value,"Descripción (español)"),den=text(f.d_en.value,"Descripción (inglés)");
  if(des||den){x.d={};if(des)x.d.es=des;if(den)x.d.en=den}else delete x.d;
  const u=url(f.url.value,"Enlace de compra");if(u)x.url=u;else delete x.url;
  if(f.cta.value)x.cta=f.cta.value;else delete x.cta;
  if(!ed.photos.length)throw new Error("Añade al menos una foto.");
  if(list.some((m,i)=>i!==ed.i&&m.t.es===x.t.es))throw new Error("Ya hay un producto con ese nombre.");
  const name=slug(x.t.es);
  x.imgs=ed.photos.map(p=>{if(!p.blob)return p.path;const path=freePath(name,true);setPending(path,p);return path});
 }
 if(ed.i<0){if(tab==="releases")list.unshift(x);else list.push(x)}else list[ed.i]=x;
}
function setPending(path,img){const old=pending.get(path);if(old&&old.url!==img.url)URL.revokeObjectURL(old.url);pending.set(path,{blob:img.blob,url:img.url})}

/* ---------- Vista previa ---------- */
/** Portada de index.html para el primer disco. @param {string} html @returns {string} */
function withHero(html){setLang("es");return html.replace(/(<!-- portada -->)[\s\S]*?(<!-- \/portada -->)/,(m,a,b)=>a+heroHTML(work.releases[0],"pc")+b)}

let previewUrls=[];
$("previa").addEventListener("click",async()=>{
 const root=new URL("../",location.href).href;
 previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];
 const map={};for(const s in FILES)previewUrls.push(map[root+FILES[s]]=URL.createObjectURL(new Blob(["export default "+JSON.stringify(work[s])+";"],{type:"text/javascript"})));
 const imgs={};pending.forEach((v,p)=>{imgs[p]=v.url});recent.forEach((u,p)=>{imgs[p]=u});
 /* Las fotos sin publicar aún no existen en la web: se cambian por las locales en cuanto aparecen en la página. */
 const swap='(function(M){function f(e){var s=e.getAttribute("src");if(s&&M[s])e.src=M[s]}new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes")f(m.target);else m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.tagName==="IMG")f(n);if(n.querySelectorAll)n.querySelectorAll("img").forEach(f)})})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["src"]})})('+JSON.stringify(imgs).replace(/</g,"\\u003c")+');';
 let html=await (await fetch(root+"index.html",{cache:"no-store"})).text();
 html=withHero(html).replace(/<head>/i,'<head><base href="'+root+'"><script type="importmap">'+JSON.stringify({imports:map})+'</script><script>'+swap+'</script>');
 $("pframe").srcdoc=html;
 $("preview").hidden=false;
});
$("pclose").addEventListener("click",()=>{$("preview").hidden=true;$("pframe").srcdoc=""});

/* ---------- Publicar ---------- */
$("publicar").addEventListener("click",()=>{
 $("resumen").innerHTML=changes().map(c=>"<li>"+esc(c)+"</li>").join("");
 $("cferr").textContent="";$("cfok").disabled=false;
 $("confirm").showModal();
});
const closeCf=()=>$("confirm").close();
$("cfx").addEventListener("click",closeCf);$("cfcancel").addEventListener("click",closeCf);

$("cfok").addEventListener("click",async()=>{
 const btn=$("cfok");btn.disabled=true;$("cferr").textContent="Publicando…";
 try{
  await publish();
  $("cferr").textContent="";$("confirm").close();
  toast("¡Publicado! La web se actualiza en 1-2 minutos.",true);
 }catch(e){$("cferr").textContent=explain(e);btn.disabled=false}
});

async function publish(){
 /* Si alguien ha publicado mientras se editaba: se sigue sólo si no ha tocado los mismos archivos. */
 const head=await gh.head();
 if(head.sha!==base.sha){
  const touched=[...Object.values(FILES),"index.html","sitemap.xml"].filter(p=>head.files[p]!==base.files[p]);
  if(touched.length)throw new Error("Alguien ha publicado cambios en la web mientras editabas ("+touched.join(", ")+"). Copia lo que necesites, recarga la página y vuelve a hacer tus cambios.");
 }
 const write={},remove=[];
 for(const s in FILES)if(!same(orig[s],work[s]))write[FILES[s]]=serialize(s,work[s]);
 const used=allImages(work);
 pending.forEach((v,p)=>{if(used.has(p))write[p]=v.blob});
 allImages(orig).forEach(p=>{if(!used.has(p)&&head.files[p])remove.push(p)});
 const idx=withHero(indexHtml);if(idx!==indexHtml)write["index.html"]=idx;
 /* Fecha de la última modificación para los buscadores. */
 const sm=sitemap.replace(/<lastmod>[^<]*<\/lastmod>/,"<lastmod>"+new Date().toISOString().slice(0,10)+"</lastmod>");if(sm!==sitemap)write["sitemap.xml"]=sm;
 const list=changes();
 const message="Admin: "+list[0]+(list.length>1?" y "+(list.length-1)+" cambio"+(list.length>2?"s":"")+" más":"")+"\n\n"+list.map(c=>"- "+c).join("\n")+"\n";
 try{await gh.publish({parent:head.sha,tree:head.tree,message,write,remove})}
 catch(e){if(e instanceof GitHubError&&e.status===422)throw new Error("Alguien ha publicado a la vez. Vuelve a pulsar Publicar.");throw e}
 pending.forEach((v,p)=>{if(used.has(p))recent.set(p,v.url)});
 pending.clear();
 await load();
 render();
}

$("descartar").addEventListener("click",()=>{
 if(!confirm("¿Descartar todos los cambios sin publicar?"))return;
 for(const s in FILES)work[s]=clone(orig[s]);
 pending.forEach(v=>URL.revokeObjectURL(v.url));pending.clear();
 render();
});

/* ---------- Varios ---------- */
let toastT;
function toast(msg,ok){const t=$("toast");t.textContent=msg;t.className="toast on"+(ok?" ok":"");clearTimeout(toastT);toastT=setTimeout(()=>{t.className="toast"},5000)}

let leaving=false;
window.addEventListener("beforeunload",e=>{if(!leaving&&orig.releases&&changes().length){e.preventDefault();e.returnValue=""}});

$("loginf").addEventListener("submit",async e=>{
 e.preventDefault();
 const t=$("token").value.trim();if(!t)return;
 $("loginerr").textContent="Comprobando…";
 try{await start(t);setToken(t,$("recordar").checked);$("token").value=""}
 catch(err){showLogin(explain(err))}
});
$("salir").addEventListener("click",()=>{
 if(changes().length&&!confirm("Tienes cambios sin publicar. ¿Salir igualmente?"))return;
 leaving=true;setToken(null);location.reload();
});

const saved=getToken();
if(saved)start(saved).catch(err=>{if(err instanceof GitHubError&&err.status===401)setToken(null);showLogin(explain(err))});
else showLogin();
