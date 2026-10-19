/* Modelo: discos (lanzamientos).
   Es la fuente de datos de la portada (último lanzamiento), del carrusel "Lanzamientos", de su vista de lista
   y del pop up de preescucha. Los datos están en js/data/releases.js (se editan desde /admin; ver docs/admin.md y docs/contenido.md).
   a = artista principal, o lista de artistas principales si hay varios; y = año (solo el año);
   links = enlaces directos por plataforma; sp = ID del álbum en Spotify (activa la preescucha). */
import DATA from "../data/releases.js";

/**
 * Un disco (álbum o EP).
 * @typedef {Object} Release
 * @property {string} img Nombre de la portada en img/, sin extensión (se carga img/<img>.webp; cuadrada, 1200×1200).
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
export const RELEASES=DATA;

/**
 * El último lanzamiento, que se destaca en la portada: es el primero de la lista.
 * @returns {Release}
 */
export const latestRelease=()=>RELEASES[0];
