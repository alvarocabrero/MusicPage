/* Modelo: estado de un carrusel circular (posición continua, tarjeta activa, modo "ver todos"). */
export class CarouselModel{
 constructor(n){
  this.n=n;
  this.m=n*Math.ceil(8/n); /* tarjetas totales, repitiendo la lista hasta llenar el anillo */
  this.pos=0;this.act=0;this.all=false;
 }
 mod(k){return ((k%this.m)+this.m)%this.m}
 /* Fija la posición continua y recalcula la tarjeta activa. */
 setPos(k){this.pos=k;this.act=this.mod(Math.round(k));return this.act}
 /* Sólo actualiza la tarjeta activa (durante el arrastre). Devuelve true si cambió. */
 followPos(k){this.pos=k;const a=this.mod(Math.round(k));const changed=a!==this.act;this.act=a;return changed}
 /* Índice del disco/vídeo real al que corresponde la tarjeta j. */
 itemOf(j){return j%this.n}
 toggleAll(){this.all=!this.all;return this.all}
}
