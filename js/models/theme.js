/* Modelo: colores de fondo/texto de las secciones del carrusel (paleta del manual de identidad).
   Cada sección con carrusel cambia de color según la tarjeta activa (transición suave en CSS, ver carousel.css). */

/** Pares [fondo, texto] que se van alternando: negro, rojo de la marca, negro y gris. */
const STAGE=[["#000","#fff"],["#e22c14","#fff"],["#000","#fff"],["#b6bbbf","#000"]];

/**
 * Colores de la sección para la tarjeta activa.
 * @param {number} index Índice de la tarjeta activa en el anillo.
 * @param {number} n Número de elementos reales (discos, vídeos o productos).
 * @returns {{bg:string,fg:string,dash:string}} Fondo, texto y color de la rayita bajo el título
 *   ("" = rojo por defecto; sobre fondo rojo se usa el color del texto para que se vea).
 */
export function stageColors(index,n){
 const c=STAGE[(index%n)%4];
 return {bg:c[0],fg:c[1],dash:c[0]==="#e22c14"?c[1]:""};
}
