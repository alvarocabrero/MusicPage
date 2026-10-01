/* Controlador: portada (último lanzamiento), carrusel de lanzamientos y su pop up. */
import {RELEASES,latestRelease} from "../models/releases.js";
import {cardHTML,rowHTML,heroView,releaseDialogView} from "../views/releaseView.js";
import {initCarousel} from "./carouselController.js";
import {initDialog} from "./dialogController.js";

/**
 * Pinta la portada con el último lanzamiento, monta el carrusel #car-rel y conecta el pop up de preescucha,
 * que se abre desde la tarjeta activa del carrusel o desde los botones de la vista de lista.
 */
export function initReleases(){
 const latest=latestRelease();
 heroView.render(latest);
 heroView.loadPlayer(latest);

 const abrir=initDialog({items:RELEASES,view:releaseDialogView,show:r=>releaseDialogView.render(r)});
 const el=document.getElementById("car-rel");
 initCarousel({el,n:RELEASES.length,card:i=>cardHTML(RELEASES[i]),row:i=>rowHTML(RELEASES[i],i),onOpen:abrir});
 /* En la vista "ver todos", los botones de cada fila abren el pop up. */
 el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b)abrir(+b.dataset.i)});
}
