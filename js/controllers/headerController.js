/* Controlador: la cabecera es transparente mientras estamos arriba del todo. */
import {headerView} from "../views/headerView.js";

/**
 * Vigila el desplazamiento de la página: con menos de 8 px desde arriba la cabecera es transparente
 * (sin logotipo, sobre la portada); al bajar, pasa a tener fondo y logotipo.
 */
export function initHeader(){
 const update=()=>headerView.setAtTop((window.pageYOffset||document.documentElement.scrollTop)<8);
 window.addEventListener("scroll",update,{passive:true});update();
}
