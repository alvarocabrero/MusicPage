/* Controlador: la cabecera es transparente mientras estamos arriba del todo. */
import {headerView} from "../views/headerView.js";

export function initHeader(){
 const update=()=>headerView.setAtTop((window.pageYOffset||document.documentElement.scrollTop)<8);
 window.addEventListener("scroll",update,{passive:true});update();
}
