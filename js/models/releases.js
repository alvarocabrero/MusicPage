/* Modelo: discos (lanzamientos).
   Es la fuente de datos de la portada (último lanzamiento), del carrusel "Lanzamientos", de su vista de lista
   y del pop up de preescucha. Para añadir un disco basta con añadir un objeto a RELEASES (ver docs/contenido.md).
   a = artista principal, o lista de artistas principales si hay varios; y = año (solo el año);
   links = enlaces directos por plataforma; sp = ID del álbum en Spotify (activa la preescucha). */

/**
 * Un disco (álbum o EP).
 * @typedef {Object} Release
 * @property {string} img Nombre de la portada en img/, sin extensión (se carga img/<img>.webp; cuadrada, 600×600).
 * @property {string} t Título, tal cual se escribe (las tarjetas lo pasan a mayúsculas con CSS).
 * @property {string|string[]} a Artista principal o, si hay varios, la lista en orden de crédito.
 *   Se muestran unidos como "A & B" o "A, B & C".
 * @property {"album"|"ep"} k Tipo de disco; es la clave de traducción "kind.<k>" de i18n.js.
 * @property {string} y Año de salida (sólo el año, p. ej. "2026").
 * @property {number|string|{es:string,en:string}} n Número de canciones (se muestra "9 canciones" / "9 tracks")
 *   o, si no es un número, un texto libre que se muestra tal cual (traducido si es {es,en}).
 * @property {string} [sp] ID del álbum en Spotify: activa la preescucha incrustada y el enlace a Spotify.
 * @property {Object<string,string>} links Enlaces directos por plataforma; claves: bandcamp, yt, apple, ytm, tidal
 *   (spotify no hace falta: se construye a partir de sp). Las plataformas sin enlace no se muestran.
 */

/**
 * Discos, del más reciente al más antiguo: el primero es el "Último lanzamiento" de la portada
 * y el orden es el del carrusel y la lista.
 * @type {Release[]}
 */
export const RELEASES=[
 {img:"michelin-star-desserts",t:"Michelin Star Desserts",a:["Arte Kills","DigitalDust"],k:"album",y:"2026",n:9,sp:"6VGBkOI87jrnjTRuvFNyJG",links:{yt:"https://www.youtube.com/watch?v=2Kiz_oEALVk",tidal:"https://tidal.com/album/538871911",apple:"https://music.apple.com/es/album/michelin-star-desserts/6786133651",bandcamp:"https://artekills.bandcamp.com/album/michelin-star-desserts",ytm:"https://music.youtube.com/browse/MPREb_lQqqAcaSpCi"}},
 {img:"el-nudo-de-la-cereza",t:"El Nudo de la Cereza",a:"A1 Invazion",k:"album",y:"2026",n:7,sp:"5Guw6EzL57BMQc7MgFTPxE",links:{yt:"https://www.youtube.com/watch?v=cIhthXWKXo4",tidal:"https://tidal.com/album/546065606",apple:"https://music.apple.com/es/album/el-nudo-de-la-cereza-feat-lev/6794379480",ytm:"https://music.youtube.com/browse/MPREb_5miiVQU3g5K"}},
 {img:"grand-chelem",t:"Grand Chelem",a:"Arte Kills",k:"album",y:"2026",n:7,sp:"3q17McxpH6L8qiCZq6v7vR",links:{yt:"https://www.youtube.com/watch?v=NYuIrof_Kdk",tidal:"https://tidal.com/album/519731498",apple:"https://music.apple.com/es/album/grand-chelem/1896072366",bandcamp:"https://artekills.bandcamp.com/album/grand-chelem",ytm:"https://music.youtube.com/browse/MPREb_AsrZoK5XdVb"}},
 {img:"spooky-cartoons",t:"Spooky Cartoons",a:["Lev","Arte Kills"],k:"album",y:"2026",n:14,sp:"3xe8jjaywxo0SjHLDoxghX",links:{yt:"https://www.youtube.com/watch?v=0zGLNakfXVk",tidal:"https://tidal.com/album/492636246",apple:"https://music.apple.com/es/album/spooky-cartoons/1871916493",bandcamp:"https://artekills.bandcamp.com/album/spooky-cartoons",ytm:"https://music.youtube.com/browse/MPREb_X8baN6Liulr"}},
 {img:"taiga-cazador",t:"Taiga & Cazador",a:["Arte Kills","Stxners Music"],k:"album",y:"2025",n:16,sp:"7nswazETv9nz5oFonH3uUk",links:{yt:"https://www.youtube.com/watch?v=JPGars0CKHw",tidal:"https://tidal.com/album/470415446",apple:"https://music.apple.com/es/album/taiga-cazador/1850392570",bandcamp:"https://artekills.bandcamp.com/album/taiga-cazador",ytm:"https://music.youtube.com/browse/MPREb_hHwWOLSk3El"}},
 {img:"nuevo-vesuvio",t:"Nuevo Vesuvio",a:["Arte Kills","Silver J"],k:"ep",y:"2025",n:5,sp:"2uzyz2LG2ciQuzBWbs9PFD",links:{yt:"https://www.youtube.com/watch?v=hWyTrBePr7k",tidal:"https://tidal.com/album/432040998",apple:"https://music.apple.com/es/album/nuevo-vesuvio-ep/1810583619",bandcamp:"https://artekills.bandcamp.com/album/nuevo-vesuvio",ytm:"https://music.youtube.com/browse/MPREb_jU58RUmJGZI"}}
];

/**
 * El último lanzamiento, que se destaca en la portada: es el primero de la lista.
 * @returns {Release}
 */
export const latestRelease=()=>RELEASES[0];
