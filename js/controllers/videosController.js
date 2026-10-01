/* Controlador: carrusel de videoclips (avanza hacia atrás), reproductor en línea y pop up. */
import {VIDEOS} from "../models/videos.js";
import {cardHTML,rowHTML,playInline,videoDialogView} from "../views/videoView.js";
import {initCarousel} from "./carouselController.js";
import {initDialog} from "./dialogController.js";

/**
 * Monta el carrusel #car-vid y su pop up de vídeo. En la vista de lista, pulsar una miniatura (.vbtn) pone el
 * reproductor en la propia fila. El avance automático va en sentido contrario al de lanzamientos y merch (dir -1).
 */
export function initVideos(){
 const abrir=initDialog({items:VIDEOS,view:videoDialogView,show:v=>videoDialogView.render(v)});
 const el=document.getElementById("car-vid");
 el.addEventListener("click",e=>{const b=e.target.closest(".vbtn");if(b)playInline(b)});
 initCarousel({el,n:VIDEOS.length,card:i=>cardHTML(VIDEOS[i]),row:i=>rowHTML(VIDEOS[i]),onOpen:abrir,dir:-1});
}
