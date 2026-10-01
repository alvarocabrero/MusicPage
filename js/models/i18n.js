/* Modelo: idioma de la web y textos traducidos (español / inglés).
   Guarda el idioma activo y los textos de la interfaz. Los textos del HTML se marcan con data-i18n / data-i18n-attr
   (los aplica i18nView) y los que pinta JavaScript se piden con t(). Los datos de discos, merch, etc. pueden traer
   su propio texto traducido como {es,en}, que se resuelve con tr(). Para añadir un texto, se añade la misma clave
   en es y en en (ver docs/contenido.md). Cambiar de idioma recarga la página (languageController). */

/** Idiomas disponibles, en orden; el primero es el de referencia si a otro le falta un texto. */
export const LANGS=["es","en"];

/**
 * Textos de la interfaz por idioma. Las claves llevan un prefijo por zona (nav., sec., contact., release., video.,
 * merch., kind., dlg.…) y pueden tener variables entre llaves, como {t} (título) o {n} (número), que rellena t().
 * @type {Object<string,Object<string,string>>}
 */
const DICT={
 es:{
  "title":"Arte Kills · Música",
  "meta.description":"Arte Kills: música, videoclips y merch. Escucha los últimos lanzamientos en Spotify, Bandcamp, YouTube, Apple Music y Tidal.",
  "nav.contact":"Contacto","brand.home":"Arte Kills, inicio",
  "lang.label":"EN","lang.switch":"Switch to English",
  "sec.releases":"Lanzamientos","sec.videos":"Videoclips","sec.merch":"Merch",
  "viewAll":"Ver lista","viewCarousel":"Ver carrusel","carousel":"carrusel","slide":"diapositiva","slideOf":"{i} de {n}",
  "dlg.close":"Cerrar","dlg.prev":"Anterior","dlg.next":"Siguiente",
  "contact.title":"Contacto","contact.name":"Nombre","contact.email":"Email","contact.message":"Mensaje","contact.send":"Enviar mensaje",
  "contact.subject":"Nuevo mensaje desde la web de Arte Kills","contact.sending":"Enviando…","contact.sent":"¡Mensaje enviado! Gracias por escribir.","contact.failed":"No se pudo enviar. Escribe a",
  "release.latest":"Último lanzamiento","listen":"Escuchar","release.open":"Abrir {t}: preescucha y plataformas","release.cover":"Portada de {t}","release.preview":"Preescucha de {t}",
  "kind.album":"Álbum","kind.ep":"EP","tracks":"{n} canciones",
  "video.tag":"Videoclip","video.watch":"Ver vídeo","video.watchAria":"Ver {t}","video.play":"Reproducir el vídeo {t}","video.openYT":"Abrir en YouTube",
  "kind.cd":"CD","kind.vinyl":"Vinilo","kind.shirt":"Camiseta",
  "merch.view":"Ver producto","merch.viewAria":"Ver {t}","buy":"Comprar","cta.instagram":"Pedir por Instagram","photo":"Ver foto {i} de {n}"
 },
 en:{
  "title":"Arte Kills · Music",
  "meta.description":"Arte Kills: music, music videos and merch. Listen to the latest releases on Spotify, Bandcamp, YouTube, Apple Music and Tidal.",
  "nav.contact":"Contact","brand.home":"Arte Kills, home",
  "lang.label":"ES","lang.switch":"Cambiar a español",
  "sec.releases":"Releases","sec.videos":"Music videos","sec.merch":"Merch",
  "viewAll":"View list","viewCarousel":"View carousel","carousel":"carousel","slide":"slide","slideOf":"{i} of {n}",
  "dlg.close":"Close","dlg.prev":"Previous","dlg.next":"Next",
  "contact.title":"Contact","contact.name":"Name","contact.email":"Email","contact.message":"Message","contact.send":"Send message",
  "contact.subject":"New message from the Arte Kills website","contact.sending":"Sending…","contact.sent":"Message sent! Thanks for getting in touch.","contact.failed":"Couldn't send it. Write to",
  "release.latest":"Latest release","listen":"Listen","release.open":"Open {t}: preview and platforms","release.cover":"Cover of {t}","release.preview":"Preview of {t}",
  "kind.album":"Album","kind.ep":"EP","tracks":"{n} tracks",
  "video.tag":"Music video","video.watch":"Watch video","video.watchAria":"Watch {t}","video.play":"Play video {t}","video.openYT":"Open on YouTube",
  "kind.cd":"CD","kind.vinyl":"Vinyl","kind.shirt":"T-shirt",
  "merch.view":"View product","merch.viewAria":"View {t}","buy":"Buy","cta.instagram":"Order on Instagram","photo":"View photo {i} of {n}"
 }
};

/** Idioma activo ("es" o "en"); lo fija setLang() al arrancar. */
let lang="es";
/** Clave de localStorage donde se recuerda el idioma elegido con el botón ES/EN. */
const KEY="lang";

/* Idioma por defecto: el elegido antes por la persona; si no, el primero de los idiomas del navegador que soportemos; si ninguno, inglés. */
/**
 * Decide el idioma con el que arranca la web.
 * @returns {string} "es" o "en".
 */
export function detectLang(){
 try{const s=localStorage.getItem(KEY);if(LANGS.includes(s))return s}catch(e){}
 for(const l of (navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""])){
  const c=String(l).slice(0,2).toLowerCase();
  if(LANGS.includes(c))return c;
 }
 return "en";
}
/**
 * Idioma activo.
 * @returns {string}
 */
export const getLang=()=>lang;

/**
 * El otro idioma (al que lleva el botón ES/EN).
 * @returns {string}
 */
export const otherLang=()=>LANGS.find(l=>l!==lang);

/**
 * Fija el idioma activo; si no es uno de LANGS, se usa inglés.
 * @param {string} l Código de idioma.
 */
export function setLang(l){lang=LANGS.includes(l)?l:"en"}

/**
 * Recuerda el idioma elegido para las próximas visitas (si el navegador no deja usar localStorage, no pasa nada).
 * @param {string} l Código de idioma.
 */
export function rememberLang(l){try{localStorage.setItem(KEY,l)}catch(e){}}

/* Texto traducido con variables {x}. */
/**
 * Texto de la interfaz en el idioma activo. Si falta en ese idioma se usa el español y, si tampoco existe,
 * se devuelve la propia clave (así un texto olvidado se ve en pantalla en vez de romper nada).
 * @param {string} key Clave del texto, p. ej. "video.watch".
 * @param {Object<string,string|number>} [vars] Valores para las variables {nombre} del texto.
 * @returns {string}
 * @example t("tracks",{n:9}) // "9 canciones"
 */
export function t(key,vars){
 let s=(DICT[lang]&&DICT[lang][key])||DICT.es[key]||key;
 if(vars)for(const k in vars)s=s.split("{"+k+"}").join(vars[k]);
 return s;
}
/* Valor de un dato que puede venir ya traducido: "texto" o {es:"…",en:"…"}. */
/**
 * Resuelve un dato que puede estar traducido: un texto se devuelve tal cual y un objeto {es,en} da el texto
 * del idioma activo (o el español si falta).
 * @template T
 * @param {T|{es:T,en:T}} v
 * @returns {T}
 */
export function tr(v){return v&&typeof v==="object"?(v[lang]||v.es):v}
