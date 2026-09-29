/* Modelo: muelle críticamente amortiguado. Interpola una posición hacia un objetivo sin rebotes,
   arrancando y frenando de forma suave; conserva la velocidad si se cambia de objetivo en pleno movimiento. */
export class Spring{
 constructor(){this.x=0;this.v=0;this.target=0;this.omega=7}
 /* omega: rigidez (rad/s). Más alto = más rápido; ~7 ≈ 0,6 s, ~2 ≈ 2 s. */
 to(target,omega){this.target=target;if(omega)this.omega=omega}
 /* Coloca el muelle en x, sin movimiento. */
 snap(x){this.x=x;this.target=x;this.v=0}
 /* Detiene el movimiento donde esté ahora. */
 stop(){this.target=this.x;this.v=0}
 /* Avanza dt segundos con la solución exacta del muelle (estable para cualquier dt). Devuelve true si sigue moviéndose. */
 step(dt){
  const w=this.omega,d=this.x-this.target,B=this.v+w*d,e=Math.exp(-w*dt);
  this.x=this.target+(d+B*dt)*e;
  this.v=(this.v-w*B*dt)*e;
  if(Math.abs(this.x-this.target)<0.0005&&Math.abs(this.v)<0.005){this.x=this.target;this.v=0;return false}
  return true;
 }
}
