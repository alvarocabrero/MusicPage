/* Controlador: carrusel de merch y su pop up de producto (galería de fotos). */
import {MERCH} from "../models/merch.js";
import {cardHTML,rowHTML,merchDialogView} from "../views/merchView.js";
import {initCarousel} from "./carouselController.js";
import {initDialog} from "./dialogController.js";

export function initMerch(){
 const abrir=initDialog({items:MERCH,view:merchDialogView,show:m=>merchDialogView.render(m)});
 const el=document.getElementById("car-merch");
 initCarousel({el,n:MERCH.length,card:i=>cardHTML(MERCH[i]),row:i=>rowHTML(MERCH[i],i),onOpen:abrir});
 /* En la vista "ver todos", los botones de cada fila abren el pop up. */
 el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b)abrir(+b.dataset.i)});
 /* Miniaturas del pop up. */
 merchDialogView.body.addEventListener("click",e=>{const b=e.target.closest(".mt button");if(b)merchDialogView.showPhoto(b)});
}
