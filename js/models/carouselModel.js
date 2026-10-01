/* Modelo: estado de un carrusel circular (posición continua, tarjeta activa, modo "ver todos").
   El anillo tiene m tarjetas, que repiten la lista de n elementos las veces necesarias para llenar la pantalla
   (con pocos elementos, cada uno aparece varias veces). La posición es continua: pos = 2,4 significa que el anillo
   está entre la tarjeta 2 y la 3; la activa es la más cercana. No sabe nada del DOM: lo usa carouselController. */
export class CarouselModel{
 /* slots: huecos mínimos del anillo (los que hacen falta para cubrir el ancho de la pantalla). */
 /**
  * @param {number} n Número de elementos reales (discos, vídeos o productos).
  * @param {number} [slots=8] Huecos mínimos del anillo; carouselController los calcula según el ancho de la pantalla.
  */
 constructor(n,slots=8){
  /** Número de elementos reales. @type {number} */
  this.n=n;
  /** Número de tarjetas del anillo: el primer múltiplo de n que llega a slots. @type {number} */
  this.m=n*Math.ceil(slots/n); /* tarjetas totales, repitiendo la lista hasta llenar el anillo */
  /* pos: posición continua (puede ser negativa o pasar de m; se reduce con mod). act: índice de la tarjeta activa (0..m-1).
     all: true mientras se muestra la vista de lista ("Ver lista") en lugar del carrusel. */
  this.pos=0;this.act=0;this.all=false;
 }
 /**
  * Lleva cualquier índice entero al rango 0..m-1 (también los negativos).
  * @param {number} k
  * @returns {number}
  */
 mod(k){return ((k%this.m)+this.m)%this.m}
 /* Fija la posición continua y recalcula la tarjeta activa. */
 /**
  * @param {number} k Nueva posición (normalmente entera: la tarjeta a la que se va).
  * @returns {number} Índice de la tarjeta activa.
  */
 setPos(k){this.pos=k;this.act=this.mod(Math.round(k));return this.act}
 /* Sólo actualiza la tarjeta activa (durante el arrastre). Devuelve true si cambió. */
 /**
  * @param {number} k Posición continua actual (la que marca el dedo o el ratón).
  * @returns {boolean} true si ha cambiado la tarjeta activa (para actualizar colores y accesibilidad).
  */
 followPos(k){this.pos=k;const a=this.mod(Math.round(k));const changed=a!==this.act;this.act=a;return changed}
 /* Índice del disco/vídeo real al que corresponde la tarjeta j. */
 /**
  * @param {number} j Índice de la tarjeta en el anillo (0..m-1).
  * @returns {number} Índice del elemento real (0..n-1).
  */
 itemOf(j){return j%this.n}
 /**
  * Alterna entre carrusel y vista de lista.
  * @returns {boolean} true si ahora se muestra la lista.
  */
 toggleAll(){this.all=!this.all;return this.all}
}
