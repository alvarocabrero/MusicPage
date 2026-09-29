/* Controlador: comportamiento de un carrusel (clic, arrastre, teclado, "ver todos" y avance automático).
   El movimiento lo genera un muelle (Spring) que se anima en cada fotograma. */
import {CarouselModel} from "../models/carouselModel.js";
import {Spring} from "../models/spring.js";
import {createCarouselView} from "../views/carouselView.js";

const OMEGA_MANUAL=7;   /* rigidez al mover con clic, teclado o al soltar (≈ 0,6 s) */
const OMEGA_AUTO=2.2;   /* rigidez del avance automático: muy lento (≈ 2 s) */
const IDLE_MS=12000;    /* tiempo sin interacción antes de reanudar el avance automático */

/* dir: 1 avanza al siguiente, -1 al anterior. every: milisegundos entre avances automáticos. */
export function initCarousel({el,n,card,row,onOpen,dir=1,every=6500}){
 const model=new CarouselModel(n);
 const spring=new Spring();
 const view=createCarouselView(el,{n,m:model.m,card,row});
 let drag=null,dragged=false,lastUser=-Infinity;
 const touch=()=>{lastUser=performance.now()};

 /* Bucle de animación: sólo corre mientras el muelle se está moviendo. */
 let raf=0,last=0;
 function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const moving=spring.step(dt);
  view.layout(spring.x);
  raf=moving?requestAnimationFrame(frame):0;
 }
 function run(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}

 function set(k,omega){
  model.setPos(k);spring.to(k,omega);
  view.state(model.act,model.all);
  run();
 }

 view.stage.addEventListener("click",e=>{
  const c=view.cardAt(e.target);if(!c)return;
  touch();
  if(dragged){e.preventDefault();return}
  if(c.j!==model.act){e.preventDefault();set(Math.round(model.pos)+Math.round(view.offsetOf(c.j)),OMEGA_MANUAL)}
  else if(onOpen)onOpen(model.itemOf(c.j));
 });

 view.stage.addEventListener("dragstart",e=>e.preventDefault());
 view.stage.addEventListener("pointerdown",e=>{
  if(e.button)return;
  touch();
  drag={x:e.clientX,p:model.pos,moved:false,h:[[e.clientX,performance.now()]]};dragged=false;view.setRingDrag(true);
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
  const p=drag.p-dx/view.unit();
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
  const h=d.h,a=h[0],b=h[h.length-1],v=b[1]>a[1]?(a[0]-b[0])/(b[1]-a[1])/view.unit():0;
  view.setDragging(false);
  spring.v=Math.max(-12,Math.min(12,v*1000));
  set(Math.round(model.pos+Math.max(-2,Math.min(2,v*220))),OMEGA_MANUAL);
 }));
 view.stage.addEventListener("pointermove",e=>view.moveRing(e.clientX,e.clientY));
 view.stage.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){e.preventDefault();touch();set(Math.round(model.pos)+1,OMEGA_MANUAL)}
  else if(e.key==="ArrowLeft"){e.preventDefault();touch();set(Math.round(model.pos)-1,OMEGA_MANUAL)}
 });
 window.addEventListener("resize",()=>{if(!view.stage.clientWidth)return;view.layout(spring.x)});

 view.vt.addEventListener("click",()=>{
  view.stopVideos();view.setAll(model.toggleAll());
  if(!model.all){view.layout(spring.x);view.state(model.act,model.all)}
 });

 /* Avance automático lento. Se detiene mientras el usuario interactúa (ratón encima, foco, arrastre, dedo)
    y hasta IDLE_MS después de la última interacción. */
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

 spring.snap(0);view.layout(0);view.state(model.act,model.all);
}
