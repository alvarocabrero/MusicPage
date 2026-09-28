/* Controlador: comportamiento común de un pop up con flechas (cerrar, clic fuera, anterior/siguiente, teclado). */
import {Cursor} from "../models/cursor.js";

/* items: lista de elementos; view: vista del pop up; show(i) pinta el elemento i. */
export function initDialog({items,view,show}){
 const cursor=new Cursor(items.length);
 function abrir(i){cursor.goto(i);show(items[cursor.index]);view.open()}
 view.close.onclick=()=>view.hide();
 view.el.addEventListener("click",e=>{if(e.target===view.el)view.hide()});
 view.el.addEventListener("close",()=>view.clear());
 view.prev.onclick=()=>abrir(cursor.step(-1));
 view.next.onclick=()=>abrir(cursor.step(1));
 document.addEventListener("keydown",e=>{
  const d=e.key==="ArrowLeft"?-1:e.key==="ArrowRight"?1:0;
  if(d&&view.isOpen())abrir(cursor.step(d));
 });
 return abrir;
}
