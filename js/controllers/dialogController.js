/* Controlador: comportamiento común de un pop up con flechas (cerrar, clic fuera, anterior/siguiente, teclado y, en móvil, deslizar como cartas).
   Sirve para los tres pop ups (disco, vídeo y producto): cada vista ofrece la misma interfaz (el, prev, next,
   close, open, hide, isOpen, clear) y aquí se conecta. Al cerrar, la vista se vacía (clear) para que no siga
   sonando ningún reproductor. La tecla Escape la gestiona el propio <dialog> del navegador. */
import {Cursor} from "../models/cursor.js";

/* Móvil: deslizar el pop up a izquierda o derecha pasa al siguiente o anterior, como una baraja de cartas.
   La tarjeta sigue al dedo girando un poco; si se suelta pasados 80 px (o con un gesto rápido) sale volando y entra
   la siguiente por el lado contrario; si no, vuelve a su sitio. Sólo con el dedo (pointerType "touch"); con touch-action
   pan-y el desplazamiento vertical del contenido sigue funcionando. Los reproductores incrustados (iframe) se quedan
   con sus propios toques: el gesto se hace sobre la cabecera, el borde o el pie del pop up. */
const UMBRAL=80,SALIDA=180,ENTRADA=320;
/**
 * @param {HTMLElement} box Caja visible del pop up (.dbox).
 * @param {function(number):void} go Pasa al elemento siguiente (1) o anterior (-1).
 */
function initSwipe(box,go){
 let id=null,x0=0,y0=0,t0=0,dx=0,horiz=false,busy=false;
 box.style.touchAction="pan-y";
 const pose=x=>"translateX("+x+"px) rotate("+x/22+"deg)";
 box.addEventListener("pointerdown",e=>{
  if(e.pointerType!=="touch"||busy||id!==null)return;
  id=e.pointerId;x0=e.clientX;y0=e.clientY;t0=e.timeStamp;dx=0;horiz=false;
 });
 box.addEventListener("pointermove",e=>{
  if(e.pointerId!==id)return;
  const mx=e.clientX-x0,my=e.clientY-y0;
  if(!horiz){
   if(Math.abs(mx)<10||Math.abs(mx)<Math.abs(my)*1.5)return;
   horiz=true;
   try{box.setPointerCapture(id)}catch(err){}
  }
  dx=mx;
  box.style.transform=pose(dx);
 });
 const fin=e=>{
  if(e.pointerId!==id)return;
  id=null;
  if(!horiz)return;
  horiz=false;
  const rapido=Math.abs(dx)/Math.max(1,e.timeStamp-t0)>0.5;
  if(e.type==="pointercancel"||(Math.abs(dx)<UMBRAL&&!rapido)){
   const a=box.animate([{transform:pose(dx)},{transform:"none"}],{duration:200,easing:"ease-out"});
   box.style.transform="";
   return a;
  }
  const d=dx<0?1:-1,lado=-d;
  busy=true;
  box.animate([{transform:pose(dx),opacity:1},{transform:pose(lado*innerWidth),opacity:0}],{duration:SALIDA,easing:"ease-in"}).onfinish=()=>{
   box.style.transform="";
   go(d);
   box.animate([{transform:pose(-lado*innerWidth*.6),opacity:0},{transform:"none",opacity:1}],{duration:ENTRADA,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=()=>{busy=false};
  };
  box.style.transform="translateX("+lado*innerWidth+"px)";
 };
 box.addEventListener("pointerup",fin);
 box.addEventListener("pointercancel",fin);
}

/* La primera vez que se abre un pop up en un móvil, la carta hace un amago de deslizarse a la izquierda y vuelve,
   para enseñar que se puede pasar con el dedo. Sólo una vez por visita y no si se pide reducir el movimiento. */
let pistaHecha=false;
/**  {HTMLElement} box Caja visible del pop up (.dbox). */
function pista(box){
 if(pistaHecha||!matchMedia("(pointer:coarse)").matches||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 pistaHecha=true;
 box.animate([{transform:"none"},{transform:"translateX(-46px) rotate(-2deg)"},{transform:"translateX(8px) rotate(.4deg)"},{transform:"none"}],{duration:1000,delay:450,easing:"ease-in-out"});
}

/* items: lista de elementos; view: vista del pop up; show(i) pinta el elemento i. */
/**
 * @template T
 * @param {Object} o
 * @param {T[]} o.items Elementos por los que se navega con las flechas (en bucle).
 * @param {Object} o.view Vista del pop up (releaseDialogView, videoDialogView o merchDialogView).
 * @param {function(T):void} o.show Pinta un elemento en el pop up.
 * @returns {function(number):void} abrir(i): muestra el elemento i y abre el pop up (si no estaba abierto).
 */
export function initDialog({items,view,show}){
 const cursor=new Cursor(items.length);
 /* Contador "2 / 9" entre las flechas (se ve en móvil, donde las flechas van debajo del pop up). */
 const cuenta=document.createElement("span");
 cuenta.className="dcount";
 cuenta.setAttribute("aria-live","polite");
 view.prev.after(cuenta);
 /* .deck: en móvil, dos cartas asoman por detrás del pop up para que se vea que es una baraja (dialogs.css). */
 view.el.classList.add("deck");
 const caja=view.el.querySelector(".dbox");
 function abrir(i){
  cursor.goto(i);show(items[cursor.index]);
  cuenta.textContent=(cursor.index+1)+" / "+items.length;
  const recien=!view.isOpen();
  view.open();
  if(recien&&caja&&items.length>1)pista(caja);
 }
 view.close.onclick=()=>view.hide();
 /* Un clic en el fondo oscuro (fuera de la caja) llega al propio <dialog>: entonces se cierra. */
 view.el.addEventListener("click",e=>{if(e.target===view.el)view.hide()});
 view.el.addEventListener("close",()=>view.clear());
 view.prev.onclick=()=>abrir(cursor.step(-1));
 view.next.onclick=()=>abrir(cursor.step(1));
 if(caja)initSwipe(caja,d=>abrir(cursor.step(d)));
 /* ← y → pasan al anterior/siguiente mientras el pop up está abierto. */
 document.addEventListener("keydown",e=>{
  const d=e.key==="ArrowLeft"?-1:e.key==="ArrowRight"?1:0;
  if(d&&view.isOpen())abrir(cursor.step(d));
 });
 return abrir;
}
