/* Controlador: carrusel de videoclips (avanza hacia atrás), reproductor en línea y pop up. */
import {VIDEOS,esNuevo} from "../models/videos.js";
import {cardHTML,rowHTML,playInline,videoDialogView,newsDialogView} from "../views/videoView.js";
import {initCarousel} from "./carouselController.js";
import {initDialog} from "./dialogController.js";

/**
 * Pop up de novedad: cada vez que se abre la web, si el videoclip más reciente es nuevo (ver esNuevo), se anuncia.
 * Pulsar la miniatura abre el vídeo en YouTube (enlace normal) y cierra el aviso.
 */
function initNews(){
 const v=VIDEOS[0];
 if(!esNuevo(v))return;
 newsDialogView.render(v);
 newsDialogView.close.onclick=()=>newsDialogView.hide();
 newsDialogView.el.addEventListener("click",e=>{
  if(e.target===newsDialogView.el)newsDialogView.hide();
  else if(e.target.closest(".nbtn"))newsDialogView.hide();
 });
 setTimeout(()=>{
  if(document.querySelector("dialog[open]"))return;
  newsDialogView.open();
 },1500);
}

/**
 * Monta el carrusel #car-vid y su pop up de vídeo. En la vista de lista, pulsar una miniatura (.vbtn) pone el
 * reproductor en la propia fila. El avance automático va en sentido contrario al de lanzamientos y merch (dir -1).
 */
export function initVideos(){
 const abrir=initDialog({items:VIDEOS,view:videoDialogView,show:v=>videoDialogView.render(v)});
 const el=document.getElementById("car-vid");
 el.addEventListener("click",e=>{const b=e.target.closest(".vbtn");if(b)playInline(b)});
 /* Si el videoclip más reciente es nuevo, la portada lo anuncia (lo pinta heroView) y al pulsarlo abre su pop up. */
 const aviso=document.querySelector("#hrel .novedad");
 if(aviso)aviso.onclick=()=>abrir(0);
 initNews();
 initCarousel({el,n:VIDEOS.length,card:i=>cardHTML(VIDEOS[i]),row:i=>rowHTML(VIDEOS[i]),onOpen:abrir,dir:-1});
}
