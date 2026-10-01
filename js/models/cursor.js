/* Modelo: posición actual dentro de una lista circular (para navegar por los pop ups).
   Al pasar del último se vuelve al primero y al revés; lo usa dialogController para las flechas anterior/siguiente. */
export class Cursor{
 /**
  * @param {number} length Número de elementos de la lista.
  */
 constructor(length){this.length=length;this.index=0}
 /**
  * Va al elemento i (cualquier entero; se ajusta al rango de forma circular).
  * @param {number} i
  * @returns {number} Índice resultante (0..length-1).
  */
 goto(i){this.index=((i%this.length)+this.length)%this.length;return this.index}
 /**
  * Avanza d posiciones (−1 = anterior, 1 = siguiente).
  * @param {number} d
  * @returns {number} Índice resultante.
  */
 step(d){return this.goto(this.index+d)}
}
