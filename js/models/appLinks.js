/* Modelo: abrir los enlaces de escucha en la app instalada (móvil o escritorio) en lugar de la web. */
import {platform} from "./platforms.js";

const ua=navigator.userAgent;
/* iPadOS se presenta como un Mac, pero con pantalla táctil. */
const esIOS=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
export const SO=/Android/.test(ua)?"android":esIOS?"ios":/Macintosh/.test(ua)?"mac":"pc";
export const esMovil=SO==="android"||SO==="ios";

/* Android: un enlace intent:// abre la app si está instalada y, si no, la web (browser_fallback_url). */
function intentUrl(url,pkg){
 const u=new URL(url);
 return "intent://"+u.host+u.pathname+u.search+"#Intent;scheme=https;package="+pkg+";S.browser_fallback_url="+encodeURIComponent(url)+";end";
}

/* Atributos del enlace según el dispositivo. En iOS la URL web ya abre la app (enlace universal),
   pero sólo si se sigue en la misma pestaña, así que en móvil no se abre pestaña nueva. */
export function linkAttrs(id,url){
 const p=platform(id);
 if(SO==="android"&&p&&p.and)return {href:intentUrl(url,p.and),blank:false};
 return {href:url,blank:!esMovil};
}

/* Escritorio: enlace que abre la app de la plataforma ("" si no tiene app o esquema). */
export function desktopAppUrl(id,url){
 const p=platform(id);
 return !esMovil&&p&&p.app?p.app(url,SO):"";
}

/* Si una plataforma no abrió app, se va directo a la web (sin esperar) durante una semana;
   pasado ese tiempo se vuelve a probar, por si se ha instalado. */
const KEY="appLinks",SEMANA=7*864e5;
function leer(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function guardar(m){try{localStorage.setItem(KEY,JSON.stringify(m))}catch(e){}}
export const sinApp=id=>Date.now()-(leer()[id]||0)<SEMANA;
export function recordarApp(id,abrio){const m=leer();if(abrio)delete m[id];else m[id]=Date.now();guardar(m)}
