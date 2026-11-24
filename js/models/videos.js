/* Modelo: videoclips (YouTube).
   Fuente de datos del carrusel "Videoclips", de su vista de lista (reproductor en línea) y del pop up de vídeo.
   d = fecha de publicación en YouTube (AAAA-MM-DD). La lista se ordena sola, del más reciente al más antiguo,
   así que los vídeos nuevos pueden añadirse en cualquier posición. */

/**
 * Un videoclip.
 * @typedef {Object} Video
 * @property {string} id ID del vídeo en YouTube (lo que va tras "watch?v=").
 * @property {string} t Título que se muestra (sin añadidos como "(visualizer)").
 * @property {string} d Fecha de publicación en YouTube, AAAA-MM-DD; sólo se usa para ordenar.
 */

/**
 * Videoclips, ordenados del más reciente al más antiguo (por d).
 * @type {Video[]}
 */
export const VIDEOS=[
 {id:"9UJ9nkkfoyU",t:"Lumbre",d:"2026-11-23"},
 {id:"NYuIrof_Kdk",t:"Grand Chelem",d:"2026-04-29"},
 {id:"sLtKuVB39J0",t:"Expediciones en La Taiga",d:"2025-11-21"},
 {id:"jdn0HGqiUPY",t:"Berdan Nº02",d:"2025-11-07"},
 {id:"xmjx8gfOO5M",t:"Spooky Cartoons",d:"2025-10-30"},
 {id:"pCnuXTHBfGM",t:"Mesa Reservada",d:"2025-05-09"},
 {id:"xgTiVnYMqH0",t:"Televice",d:"2023-09-15"}
].sort((a,b)=>b.d.localeCompare(a.d));

/** Días que un videoclip se anuncia como "Nuevo" desde su fecha de publicación. */
const DIAS_NUEVO=30;
/**
 * ¿Se publicó hace menos de DIAS_NUEVO días? Entonces la tarjeta lleva la etiqueta "Nuevo" (se apaga sola).
 * @param {Video} v
 * @returns {boolean}
 */
export const esNuevo=v=>Date.now()-Date.parse(v.d)<DIAS_NUEVO*864e5;

/* Miniatura en la mayor resolución disponible (1280×720); si el vídeo no la tiene, se prueba con las siguientes. */

/**
 * URL de una miniatura de YouTube.
 * @param {string} id ID del vídeo.
 * @param {string} f Nombre de la miniatura: "maxresdefault" (1280×720), "sddefault" (640×480) o "hqdefault" (480×360).
 * @returns {string}
 */
const thumb=(id,f)=>"https://i.ytimg.com/vi/"+id+"/"+f+".jpg";

/**
 * Miniatura principal (1280×720). No todos los vídeos la tienen: la vista comprueba el tamaño al cargar
 * y, si es la imagen genérica de 120 px, pasa a las de respaldo.
 * @param {string} id ID del vídeo.
 * @returns {string}
 */
export const videoThumb=id=>thumb(id,"maxresdefault");

/**
 * Miniaturas de respaldo, en orden de preferencia.
 * @param {string} id ID del vídeo.
 * @returns {string[]}
 */
export const videoThumbFallbacks=id=>[thumb(id,"sddefault"),thumb(id,"hqdefault")];

/**
 * URL del reproductor incrustado: dominio sin cookies de YouTube, vídeos relacionados sólo del mismo canal (rel=0)
 * y, en el iPhone, reproducción dentro del pop up o de la lista en vez de a pantalla completa (playsinline=1; el
 * botón de pantalla completa del reproductor sigue funcionando). Con autoplay empieza a sonar solo: se usa en la vista
 * de lista, donde ya se ha pulsado "reproducir"; el pop up no lo usa (hay que darle al play del reproductor).
 * @param {string} id ID del vídeo.
 * @param {boolean} [autoplay=false] Reproducción automática.
 * @returns {string}
 */
export const videoEmbedUrl=(id,autoplay)=>"https://www.youtube-nocookie.com/embed/"+id+"?"+(autoplay?"autoplay=1&":"")+"rel=0&playsinline=1";

/**
 * URL del vídeo en youtube.com (enlace "Abrir en YouTube" de la vista de lista).
 * @param {string} id ID del vídeo.
 * @returns {string}
 */
export const videoWatchUrl=id=>"https://www.youtube.com/watch?v="+id;
