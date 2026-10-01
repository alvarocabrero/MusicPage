/* Modelo: plataformas de escucha, en el orden en que se muestran.
   d = enlace directo derivado del disco; s = URL de búsqueda (ya no se usa en la web);
   and = paquete de la app de Android; app(url,so) = enlace que abre la app de escritorio ("" si no hay).
   Lo usan la portada y el pop up de cada disco (botones "Escuchar en…") y appLinks.js (abrir en la app). */

/**
 * Una plataforma de escucha.
 * @typedef {Object} Platform
 * @property {string} id Identificador; es también la clave del enlace en Release.links y del icono en PICON.
 * @property {string} n Nombre que se muestra en el botón.
 * @property {string} s URL de búsqueda en la plataforma (se conserva, pero la web ya no la usa).
 * @property {function(import("./releases.js").Release):string} [d] Enlace directo calculado a partir del disco
 *   cuando no viene en links (Spotify, a partir de sp). "" si no se puede.
 * @property {string} and Paquete de la app de Android (para los enlaces intent:// de appLinks.js).
 * @property {function(string,string):string} [app] A partir de la URL web y del sistema ("mac", "pc"…),
 *   devuelve el enlace que abre la app de escritorio, o "" si no hay app para ese caso.
 */

/* Saca el ID del álbum de la URL web y lo pone tras el prefijo del esquema de la app. */
/**
 * @param {string} u URL web del álbum.
 * @param {RegExp} re Expresión cuyo primer grupo es el ID del álbum.
 * @param {string} pre Prefijo del esquema de la app (p. ej. "spotify:album:").
 * @returns {string} Enlace de la app, o "" si la URL no tiene ID.
 */
const idDe=(u,re,pre)=>{const m=u.match(re);return m?pre+m[1]:""};

/**
 * Plataformas, en el orden de los botones. Spotify abre la app de escritorio con spotify:album:<id>, Tidal con
 * tidal://album/<id> y Apple Music sólo en Mac (cambiando https: por music:). El resto abre la web.
 * @type {Platform[]}
 */
export const PLATS=[
 {id:"bandcamp",n:"Bandcamp",s:"https://bandcamp.com/search?q=",and:"com.bandcamp.android"},
 {id:"spotify",n:"Spotify",s:"https://open.spotify.com/search/",d:r=>r.sp?"https://open.spotify.com/album/"+r.sp:"",and:"com.spotify.music",app:u=>idDe(u,/\/album\/(\w+)/,"spotify:album:")},
 {id:"yt",n:"YouTube",s:"https://www.youtube.com/results?search_query=",and:"com.google.android.youtube"},
 {id:"apple",n:"Apple Music",s:"https://music.apple.com/es/search?term=",and:"com.apple.android.music",app:(u,so)=>so==="mac"?u.replace(/^https:/,"music:"):""},
 {id:"ytm",n:"YouTube Music",s:"https://music.youtube.com/search?q=",and:"com.google.android.apps.youtube.music"},
 {id:"tidal",n:"Tidal",s:"https://tidal.com/search?q=",and:"com.aspiro.tidal",app:u=>idDe(u,/\/album\/(\d+)/,"tidal://album/")}
];

/* Sólo las plataformas con enlace para ese disco. */
/**
 * Enlaces de escucha de un disco: para cada plataforma, el enlace de links o, si no hay, el que se deriva
 * del disco (d). Las plataformas sin enlace se quitan, así que cada disco muestra sólo las suyas.
 * @param {import("./releases.js").Release} r Disco.
 * @returns {{p:Platform,url:string}[]} Plataforma y URL web, en el orden de PLATS.
 */
export function linksFor(r){
 return PLATS.map(p=>({p:p,url:(r.links&&r.links[p.id])||(p.d?p.d(r):"")})).filter(x=>x.url);
}

/**
 * Busca una plataforma por su id.
 * @param {string} id
 * @returns {Platform|undefined}
 */
export const platform=id=>PLATS.find(p=>p.id===id);
