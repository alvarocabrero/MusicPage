/* Controlador: comportamiento común de un pop up con flechas (cerrar, clic fuera, anterior/siguiente, teclado).
   Sirve para los tres pop ups (disco, vídeo y producto): cada vista ofrece la misma interfaz (el, prev, next,
   close, open, hide, isOpen, clear) y aquí se conecta. Al cerrar, la vista se vacía (clear) para que no siga
   sonando ningún reproductor. La tecla Escape la gestiona el propio <dialog> del navegador. */
import {Cursor} from "../models/cursor.js";

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
 function abrir(i){cursor.goto(i);show(items[cursor.index]);view.open()}
 view.close.onclick=()=>view.hide();
 /* Un clic en el fondo oscuro (fuera de la caja) llega al propio <dialog>: entonces se cierra. */
 view.el.addEventListener("click",e=>{if(e.target===view.el)view.hide()});
 view.el.addEventListener("close",()=>view.clear());
 view.prev.onclick=()=>abrir(cursor.step(-1));
 view.next.onclick=()=>abrir(cursor.step(1));
 /* ← y → pasan al anterior/siguiente mientras el pop up está abierto. */
 document.addEventListener("keydown",e=>{
  const d=e.key==="ArrowLeft"?-1:e.key==="ArrowRight"?1:0;
  if(d&&view.isOpen())abrir(cursor.step(d));
 });
 return abrir;
}
