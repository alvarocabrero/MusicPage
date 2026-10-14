/* Modelo: abrir los enlaces de escucha en la app instalada (móvil o escritorio) en lugar de la web.
   - Android: los enlaces se convierten en intent:// con el paquete de la app y la web como alternativa.
   - iOS: la URL web ya abre la app (enlace universal) si se sigue en la misma pestaña.
   - Escritorio: appLinksController intenta el esquema de la app (spotify:, tidal://, music:) y, si en 1,5 s
     no se ha abierto, abre la web; las plataformas que no abrieron app se recuerdan una semana en localStorage. */
import {platform} from "./platforms.js";

const ua=navigator.userAgent;
/* iPadOS se presenta como un Mac, pero con pantalla táctil. */
const esIOS=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
/** Sistema del dispositivo, deducido del navegador: "android", "ios", "mac" o "pc". */
export const SO=/Android/.test(ua)?"android":esIOS?"ios":/Macintosh/.test(ua)?"mac":"pc";
/** true en Android e iOS (móviles y tabletas). */
export const esMovil=SO==="android"||SO==="ios";

/* Android: un enlace intent:// abre la app si está instalada y, si no, la web (browser_fallback_url). */
/**
 * @param {string} url URL web (https) del disco en la plataforma.
 * @param {string} pkg Paquete de la app de Android.
 * @returns {string} Enlace intent:// equivalente.
 */
function intentUrl(url,pkg){
 const u=new URL(url);
 return "intent://"+u.host+u.pathname+u.search+"#Intent;scheme=https;package="+pkg+";S.browser_fallback_url="+encodeURIComponent(url)+";end";
}

/* Atributos del enlace según el dispositivo. En iOS la URL web ya abre la app (enlace universal),
   pero sólo si se sigue en la misma pestaña, así que en móvil no se abre pestaña nueva. */
/**
 * @param {string} id Plataforma (ver PLATS).
 * @param {string} url URL web del disco en esa plataforma.
 * @returns {{href:string,blank:boolean}} href que lleva el enlace y si se abre en pestaña nueva (sólo en escritorio).
 */
export function linkAttrs(id,url){
 const p=platform(id);
 if(SO==="android"&&p&&p.and)return {href:intentUrl(url,p.and),blank:false};
 return {href:url,blank:!esMovil};
}

/* Escritorio: enlace que abre la app de la plataforma ("" si no tiene app o esquema). */
/**
 * @param {string} id Plataforma.
 * @param {string} url URL web del disco.
 * @returns {string} Enlace de la app de escritorio, o "" en móvil o si la plataforma no tiene.
 */
export function desktopAppUrl(id,url){
 const p=platform(id);
 return !esMovil&&p&&p.app?p.app(url,SO):"";
}

/* Si una plataforma no abrió app, se va directo a la web (sin esperar) durante una semana;
   pasado ese tiempo se vuelve a probar, por si se ha instalado. */
/** Clave de localStorage y duración del recuerdo (una semana, en ms). Se guarda {id: fecha del último fallo}. */
const KEY="appLinks",SEMANA=7*864e5;
/** @returns {Object<string,number>} Plataformas sin app y cuándo falló cada una ({} si no hay datos o no hay localStorage). */
function leer(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
/** @param {Object<string,number>} m Datos a guardar (si localStorage no está disponible, no se guarda). */
function guardar(m){try{localStorage.setItem(KEY,JSON.stringify(m))}catch(e){}}
/**
 * ¿Falló esta plataforma hace menos de una semana? Entonces se va directo a la web, sin intentar la app.
 * @param {string} id Plataforma.
 * @returns {boolean}
 */
export const sinApp=id=>Date.now()-(leer()[id]||0)<SEMANA;
/**
 * Apunta el resultado de intentar abrir la app: si se abrió se olvida el fallo; si no, se guarda la fecha.
 * @param {string} id Plataforma.
 * @param {boolean} abrio true si la app llegó a abrirse.
 */
export function recordarApp(id,abrio){const m=leer();if(abrio)delete m[id];else m[id]=Date.now();guardar(m)}
