/* Modelo: posición actual dentro de una lista circular (para navegar por los pop ups). */
export class Cursor{
 constructor(length){this.length=length;this.index=0}
 goto(i){this.index=((i%this.length)+this.length)%this.length;return this.index}
 step(d){return this.goto(this.index+d)}
}
