/* Controlador: comportamiento de un carrusel (clic, arrastre, teclado, "ver todos" y avance automático). */
import {CarouselModel} from "../models/carouselModel.js";
import {createCarouselView} from "../views/carouselView.js";

/* dir: 1 avanza al siguiente, -1 al anterior. every: milisegundos entre avances automáticos. */
export function initCarousel({el,n,card,row,onOpen,dir=1,every=6500}){
 const model=new CarouselModel(n);
 const view=createCarouselView(el,{n,m:model.m,card,row});
 let drag=null,dragged=false;

 function set(k,slow){
  view.setSlow(!!slow);
  model.setPos(k);view.layout(model.pos,true);view.state(model.act,model.all);
  if(!slow)view.flashMoving();
 }

 view.stage.addEventListener("click",e=>{
  const c=view.cardAt(e.target);if(!c)return;
  if(dragged){e.preventDefault();return}
  if(c.j!==model.act){e.preventDefault();set(Math.round(model.pos)+Math.round(view.offsetOf(c.j)))}
  else if(onOpen)onOpen(model.itemOf(c.j));
 });

 view.stage.addEventListener("dragstart",e=>e.preventDefault());
 view.stage.addEventListener("pointerdown",e=>{
  if(e.button)return;
  drag={x:e.clientX,p:model.pos,moved:false,h:[[e.clientX,performance.now()]]};dragged=false;view.setRingDrag(true);
 });
 window.addEventListener("pointermove",e=>{
  if(!drag)return;const dx=e.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<5)return;drag.moved=true;dragged=true;view.setDragging(true);view.clearMoving()}
  const changed=model.followPos(drag.p-dx/view.unit());
  drag.h.push([e.clientX,performance.now()]);if(drag.h.length>6)drag.h.shift();
  view.layout(model.pos,false);if(changed)view.state(model.act,model.all);
 });
 ["pointerup","pointercancel"].forEach(t=>window.addEventListener(t,()=>{
  view.setRingDrag(false);if(!drag)return;const d=drag;drag=null;
  setTimeout(()=>{dragged=false},60);
  if(!d.moved)return;
  const h=d.h,a=h[0],b=h[h.length-1],v=b[1]>a[1]?(a[0]-b[0])/(b[1]-a[1])/view.unit():0;
  view.setDragging(false);
  set(Math.round(model.pos+Math.max(-2,Math.min(2,v*220))));
 }));
 view.stage.addEventListener("pointermove",e=>view.moveRing(e.clientX,e.clientY));
 view.stage.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){e.preventDefault();set(Math.round(model.pos)+1)}
  else if(e.key==="ArrowLeft"){e.preventDefault();set(Math.round(model.pos)-1)}
 });
 window.addEventListener("resize",()=>{if(!view.stage.clientWidth)return;view.layout(model.pos,false)});

 view.vt.addEventListener("click",()=>{
  view.stopVideos();view.setAll(model.toggleAll());
  if(!model.all){view.layout(model.pos,false);view.state(model.act,model.all)}
 });

 /* Avance automático lento; se detiene si el usuario interactúa o no hay nada que mover. */
 let hov=false,foc=false;
 const reduced=window.matchMedia("(prefers-reduced-motion:reduce)");
 el.addEventListener("pointerenter",()=>{hov=true});el.addEventListener("pointerleave",()=>{hov=false});
 el.addEventListener("focusin",()=>{foc=true});el.addEventListener("focusout",()=>{foc=false});
 setInterval(()=>{
  if(model.all||drag||hov||foc||reduced.matches||document.hidden||document.querySelector("dialog[open]"))return;
  if(!view.onScreen())return;
  set(Math.round(model.pos)+dir,true);
 },every);

 view.layout(0,false);view.state(model.act,model.all);
}
