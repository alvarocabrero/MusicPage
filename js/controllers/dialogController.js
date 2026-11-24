/* Controlador: comportamiento común de un pop up con flechas (cerrar, clic fuera, anterior/siguiente, teclado y, en móvil, coverflow).
   Sirve para los tres pop ups (disco, vídeo y producto): cada vista ofrece la misma interfaz (el, prev, next,
   close, open, hide, isOpen, clear) y aquí se conecta. Al cerrar, la vista se vacía (clear) para que no siga
   sonando ningún reproductor. La tecla Escape la gestiona el propio <dialog> del navegador. */
import {Cursor} from "../models/cursor.js";

/* Móvil (≤ 700 px): coverflow. La tarjeta actual va en el centro y a los lados asoman la anterior (izquierda) y la
   siguiente (derecha), giradas en perspectiva y translúcidas (.dside, pintadas con view.peekHTML, sin reproductores).
   Al arrastrar con el dedo se mueve toda la tira y la vecina gira hasta quedar de frente; si se suelta pasado el
   umbral (o con un gesto rápido) termina de pasar, y si no, vuelve. Las flechas hacen la misma animación.
   Sólo con el dedo (pointerType "touch"); con touch-action pan-y el desplazamiento vertical sigue funcionando. Los
   reproductores incrustados (iframe) se quedan con sus propios toques: el gesto se hace sobre la cabecera, el borde
   o el pie del pop up. */
const MOVIL=matchMedia("(max-width:700px)");
/** Fracción del ancho de la tarjeta a partir de la que, al soltar, se pasa a la vecina. */
const UMBRAL=.22;
/** Milisegundos para terminar de pasar y para volver al sitio. */
const PASO=560,VUELTA=380;
/** Pose de una tarjeta a una posición del centro: desplazamiento (% de su ancho), giro (grados), reducción de
    tamaño y opacidad que pierde. */
const DESPLAZA=34,GIRO=48,ESCALA=.16,OPACIDAD=.55;
/** Curva que frena al final, sin tirón. */
const frena=t=>1-Math.pow(1-t,3);

/**
 * Coloca una tarjeta a x posiciones del centro (0 = de frente; -1 = a la izquierda; 1 = a la derecha; valores
 * intermedios mientras se arrastra). La más cercana al centro queda encima.
 * @param {HTMLElement} el
 * @param {number} x
 */
function poner(el,x){
 const a=Math.min(1,Math.abs(x));
 el.style.transform=x===0?"":"translateX("+x*DESPLAZA+"%) rotateY("+(-x*GIRO)+"deg) scale("+(1-a*ESCALA)+")";
 el.style.opacity=x===0?"":String(1-a*OPACIDAD);
 el.style.zIndex=String(2+Math.round((1-a)*10));
}

/**
 * @param {HTMLElement} caja Caja visible del pop up (.dbox).
 * @param {function(number):void} go Pasa al elemento siguiente (1) o anterior (-1) y repinta todo.
 * @returns {{lados:HTMLElement[],pasar:function(number):void,ocupado:function():boolean}}
 *   lados: tarjetas de la izquierda (anterior) y la derecha (siguiente); pasar(d): animación de paso (flechas).
 */
function initCoverflow(caja,go){
 const lados=[0,1].map(()=>{
  const el=document.createElement("div");
  el.className="dbox dside";
  el.setAttribute("aria-hidden","true");
  el.inert=true;
  caja.after(el);
  return el;
 });
 let p=0,busy=false;
 /** Pinta la tira con el desplazamiento q (fracción del ancho; negativo = hacia la izquierda). */
 const pintar=q=>{p=q;poner(caja,q);poner(lados[0],q-1);poner(lados[1],q+1)};
 const tween=(desde,hasta,ms)=>new Promise(res=>{
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)ms=0;
  const t0=performance.now();
  const k=now=>{const t=ms?Math.min(1,(now-t0)/ms):1;pintar(desde+(hasta-desde)*frena(t));t<1?requestAnimationFrame(k):res()};
  k(t0);
 });
 /* Termina de pasar desde el desplazamiento actual: la tira se mueve hasta que la vecina queda en el centro y
    entonces se cambia el contenido (la actual pasa a ser la del lado) y se vuelve a la pose de reposo. */
 async function pasar(d){
  busy=true;
  await tween(p,-d,PASO*(1-Math.min(1,Math.abs(p))));
  go(d);pintar(0);
  busy=false;
 }
 pintar(0);

 let id=null,x0=0,y0=0,t0=0,horiz=false;
 caja.style.touchAction="pan-y";
 caja.addEventListener("pointerdown",e=>{
  if(e.pointerType!=="touch"||busy||id!==null||!MOVIL.matches)return;
  id=e.pointerId;x0=e.clientX;y0=e.clientY;t0=e.timeStamp;horiz=false;
 });
 caja.addEventListener("pointermove",e=>{
  if(e.pointerId!==id)return;
  const mx=e.clientX-x0,my=e.clientY-y0;
  if(!horiz){
   if(Math.abs(mx)<10||Math.abs(mx)<Math.abs(my)*1.5)return;
   horiz=true;
   try{caja.setPointerCapture(id)}catch(err){}
  }
  pintar(Math.max(-1,Math.min(1,mx/caja.offsetWidth)));
 });
 const fin=e=>{
  if(e.pointerId!==id)return;
  id=null;
  if(!horiz)return;
  horiz=false;
  const rapido=Math.abs(p*caja.offsetWidth)/Math.max(1,e.timeStamp-t0)>0.5;
  if(e.type!=="pointercancel"&&(Math.abs(p)>UMBRAL||(rapido&&Math.abs(p)>.04)))pasar(p<0?1:-1);
  else{busy=true;tween(p,0,VUELTA).then(()=>{busy=false})}
 };
 caja.addEventListener("pointerup",fin);
 caja.addEventListener("pointercancel",fin);
 return {lados,pasar,ocupado:()=>busy};
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
 const caja=view.el.querySelector(".dbox");
 /* .cf: en móvil, el pop up es un coverflow (dialogs.css). */
 const cf=caja&&view.peekHTML&&items.length>1?initCoverflow(caja,d=>abrir(cursor.step(d))):null;
 if(cf)view.el.classList.add("cf");
 const n=items.length,vecino=d=>items[(cursor.index+d+n)%n];
 function abrir(i){
  cursor.goto(i);show(items[cursor.index]);
  if(cf){cf.lados[0].innerHTML=view.peekHTML(vecino(-1));cf.lados[1].innerHTML=view.peekHTML(vecino(1))}
  cuenta.textContent=(cursor.index+1)+" / "+n;
  view.open();
 }
 /* Anterior/siguiente: en móvil, con la animación del coverflow; si no, directo. */
 const paso=d=>{
  if(cf&&MOVIL.matches){if(!cf.ocupado())cf.pasar(d)}
  else abrir(cursor.step(d));
 };
 view.close.onclick=()=>view.hide();
 /* Un clic en el fondo oscuro (fuera de la caja) llega al propio <dialog>: entonces se cierra. */
 view.el.addEventListener("click",e=>{if(e.target===view.el)view.hide()});
 view.el.addEventListener("close",()=>view.clear());
 view.prev.onclick=()=>paso(-1);
 view.next.onclick=()=>paso(1);
 /* ← y → pasan al anterior/siguiente mientras el pop up está abierto. */
 document.addEventListener("keydown",e=>{
  const d=e.key==="ArrowLeft"?-1:e.key==="ArrowRight"?1:0;
  if(d&&view.isOpen())paso(d);
 });
 return abrir;
}
