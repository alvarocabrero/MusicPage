/* Controlador: comportamiento de un carrusel (clic, arrastre, teclado, "ver todos" y avance automático).
   El movimiento lo genera un muelle (Spring) que se anima en cada fotograma.
   Une el modelo (CarouselModel: qué tarjeta está activa), el muelle (Spring: cómo se llega a ella) y la vista
   (carouselView: dónde se pinta cada tarjeta). Lo usan releasesController, videosController y merchController,
   cada uno con su contenido. Ver docs/carrusel.md. */
import {CarouselModel} from "../models/carouselModel.js";
import {Spring} from "../models/spring.js";
import {createCarouselView} from "../views/carouselView.js";

const OMEGA_MANUAL=7;   /* rigidez al mover con clic, teclado o al soltar (≈ 0,6 s) */
const OMEGA_AUTO=2.2;   /* rigidez del avance automático: muy lento (≈ 2 s) */
const IDLE_MS=12000;    /* tiempo sin interacción antes de reanudar el avance automático */
const TOUCH_GAIN=1.5;   /* con el dedo el carrusel avanza 1,5 veces lo que se desplaza el dedo (más sensible que el ratón) */
/* Huecos del anillo: los que hacen falta para cubrir la pantalla (≈ uno cada 280 px, más los de los lados), mínimo 8.
   En el móvil se quedan en 8; sólo crecen en monitores muy anchos, para que no quede un hueco vacío a la derecha. */
const SLOTS=Math.max(8,Math.ceil(Math.max(screen.width,innerWidth)/280)+2);

/* dir: 1 avanza al siguiente, -1 al anterior. every: milisegundos entre avances automáticos. */
/**
 * Monta un carrusel dentro de un contenedor .car y le da todo su comportamiento:
 * - Clic en una tarjeta lateral: el carrusel va hasta ella. Clic en la activa: se abre su pop up (onOpen).
 * - Arrastre con ratón o dedo, con inercia al soltar (un gesto rápido avanza hasta dos tarjetas más).
 * - Flechas ← → del teclado con el escenario enfocado.
 * - Botón "Ver lista" / "Ver carrusel" de la sección.
 * - Avance automático lento, en pausa mientras la persona interactúa.
 * @param {Object} o
 * @param {HTMLElement} o.el Contenedor .car.
 * @param {number} o.n Número de elementos reales.
 * @param {function(number):string} o.card HTML del interior de la tarjeta del elemento i.
 * @param {function(number):string} o.row HTML de la fila del elemento i en la vista de lista.
 * @param {function(number):void} [o.onOpen] Se llama con el índice del elemento al pulsar la tarjeta activa.
 * @param {number} [o.dir=1] Sentido del avance automático.
 * @param {number} [o.every=6500] Milisegundos entre avances automáticos.
 */
export function initCarousel({el,n,card,row,onOpen,dir=1,every=6500}){
 const model=new CarouselModel(n,SLOTS);
 const spring=new Spring();
 const view=createCarouselView(el,{n,m:model.m,card,row});
 /* drag: gesto en curso (o null): x/p = puntero y posición al empezar, moved = si ya pasó el umbral de 5 px,
      gain = sensibilidad (ratón 1, dedo TOUCH_GAIN), h = últimas muestras [x, tiempo] para calcular la velocidad.
    dragged: true justo después de un arrastre, para ignorar el clic que el navegador lanza al soltar.
    lastUser: momento de la última interacción (para la pausa del avance automático). */
 let drag=null,dragged=false,lastUser=-Infinity;
 /** Apunta que la persona acaba de interactuar. */
 const touch=()=>{lastUser=performance.now()};

 /* Bucle de animación: sólo corre mientras el muelle se está moviendo. */
 /* raf: id del requestAnimationFrame pendiente (0 si el bucle está parado); last: tiempo del fotograma anterior. */
 let raf=0,last=0;
 /**
  * Un fotograma: avanza el muelle (dt limitado a 50 ms para que una pestaña en segundo plano no dé un salto)
  * y recoloca las tarjetas; pide otro fotograma mientras siga moviéndose.
  * @param {number} now Marca de tiempo de requestAnimationFrame.
  */
 function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const moving=spring.step(dt);
  view.layout(spring.x);
  raf=moving?requestAnimationFrame(frame):0;
 }
 /** Arranca el bucle de animación si no estaba en marcha. */
 function run(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}

 /**
  * Va a la posición k: actualiza la tarjeta activa (colores y accesibilidad al momento) y anima el muelle hasta ella.
  * @param {number} k Posición de destino (entera).
  * @param {number} omega Rigidez del muelle: OMEGA_MANUAL o OMEGA_AUTO.
  */
 function set(k,omega){
  model.setPos(k);spring.to(k,omega);
  view.state(model.act,model.all);
  run();
 }

 /* Clic: en una tarjeta lateral se va hacia ella (por el camino más corto del anillo); en la activa se abre. */
 view.stage.addEventListener("click",e=>{
  const c=view.cardAt(e.target);if(!c)return;
  touch();
  if(dragged){e.preventDefault();return}
  if(c.j!==model.act){e.preventDefault();set(Math.round(model.pos)+Math.round(view.offsetOf(c.j)),OMEGA_MANUAL)}
  else if(onOpen)onOpen(model.itemOf(c.j));
 });

 /* Arrastre: se anula el arrastre nativo de imágenes y se sigue al puntero en toda la ventana. */
 view.stage.addEventListener("dragstart",e=>e.preventDefault());
 view.stage.addEventListener("pointerdown",e=>{
  if(e.button)return;
  touch();
  drag={x:e.clientX,p:model.pos,moved:false,gain:e.pointerType==="mouse"?1:TOUCH_GAIN,h:[[e.clientX,performance.now()]]};dragged=false;view.setRingDrag(true);
 });
 window.addEventListener("pointermove",e=>{
  if(!drag)return;
  let dx=e.clientX-drag.x;
  if(!drag.moved){
   if(Math.abs(dx)<5)return;
   /* Empieza el arrastre: se agarra el carrusel donde esté ahora mismo (aunque se esté moviendo) sin dar saltos. */
   drag.moved=true;dragged=true;view.setDragging(true);
   spring.stop();model.followPos(spring.x);
   drag.p=spring.x;drag.x=e.clientX;drag.h=[[e.clientX,performance.now()]];dx=0;
  }
  touch();
  /* Arrastrar a la izquierda avanza: cada view.unit() px de desplazamiento (por la sensibilidad) es una tarjeta. */
  const p=drag.p-dx*drag.gain/view.unit();
  const changed=model.followPos(p);spring.snap(p);
  drag.h.push([e.clientX,performance.now()]);if(drag.h.length>6)drag.h.shift();
  view.layout(p);if(changed)view.state(model.act,model.all);
 });
 ["pointerup","pointercancel"].forEach(t=>window.addEventListener(t,()=>{
  view.setRingDrag(false);if(!drag)return;const d=drag;drag=null;
  setTimeout(()=>{dragged=false},60);
  if(!d.moved)return;
  touch();
  /* Al soltar, el muelle sigue con la velocidad del gesto hasta la tarjeta más cercana. */
  /* v: velocidad del gesto en tarjetas por milisegundo (de la primera a la última de las muestras recientes).
     El muelle la recibe en tarjetas por segundo (como mucho 16) y el destino se adelanta hasta dos tarjetas
     según lo rápido que haya sido el gesto. */
  const h=d.h,a=h[0],b=h[h.length-1],v=b[1]>a[1]?(a[0]-b[0])/(b[1]-a[1])/view.unit()*d.gain:0;
  view.setDragging(false);
  spring.v=Math.max(-16,Math.min(16,v*1000));
  set(Math.round(model.pos+Math.max(-2,Math.min(2,v*220))),OMEGA_MANUAL);
 }));
 /* Cursor circular que sigue al ratón por el escenario. */
 view.stage.addEventListener("pointermove",e=>view.moveRing(e.clientX,e.clientY));
 /* Teclado: el escenario es enfocable (tabindex="0" en el HTML); ← y → mueven una tarjeta. */
 view.stage.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){e.preventDefault();touch();set(Math.round(model.pos)+1,OMEGA_MANUAL)}
  else if(e.key==="ArrowLeft"){e.preventDefault();touch();set(Math.round(model.pos)-1,OMEGA_MANUAL)}
 });
 /* Cambio de tamaño u orientación: se recoloca (si el carrusel está oculto por la vista de lista, no hace falta). */
 window.addEventListener("resize",()=>{if(!view.stage.clientWidth)return;view.layout(spring.x)});

 /* Botón "Ver lista" / "Ver carrusel": para los vídeos que suenan en la lista y alterna la vista. */
 view.vt.addEventListener("click",()=>{
  view.stopVideos();view.setAll(model.toggleAll());
  if(!model.all){view.layout(spring.x);view.state(model.act,model.all)}
 });

 /* Avance automático lento. Se detiene mientras el usuario interactúa (ratón encima, foco, arrastre, dedo)
    y hasta IDLE_MS después de la última interacción. */
 /* También se salta si se está en la vista de lista, si el carrusel ya se mueve, si la persona prefiere menos
    movimiento (prefers-reduced-motion), si la pestaña no se ve, si hay un pop up abierto o si el carrusel no está en pantalla. */
 let hov=false,foc=false;
 const reduced=window.matchMedia("(prefers-reduced-motion:reduce)");
 el.addEventListener("pointerenter",()=>{hov=true});el.addEventListener("pointerleave",()=>{hov=false});
 el.addEventListener("focusin",()=>{foc=true});el.addEventListener("focusout",()=>{foc=false});
 setInterval(()=>{
  if(model.all||drag||raf||hov||foc||reduced.matches||document.hidden||document.querySelector("dialog[open]"))return;
  if(performance.now()-lastUser<IDLE_MS)return;
  if(!view.onScreen())return;
  set(Math.round(model.pos)+dir,OMEGA_AUTO);
 },every);

 /* Estado inicial: primera tarjeta activa, sin animación. */
 spring.snap(0);view.layout(0);view.state(model.act,model.all);
}
