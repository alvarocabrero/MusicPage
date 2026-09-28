/* Controlador: sección de merch (galería de fotos de cada producto). */
import {MERCH,MERCH_ENVIO} from "../models/merch.js";
import {merchView} from "../views/merchView.js";

export function initMerch(){
 merchView.render(MERCH,MERCH_ENVIO);
 merchView.grid.addEventListener("click",e=>{const b=e.target.closest(".mt button");if(b)merchView.showPhoto(b)});
}
