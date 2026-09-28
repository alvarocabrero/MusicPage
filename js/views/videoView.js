/* Vista: videoclips (tarjetas del carrusel, filas de "ver todos", reproductor en línea y pop up). */
import {ICON_PLAY} from "./icons.js";
import {videoThumb,videoEmbedUrl,videoWatchUrl} from "../models/videos.js";

const $=id=>document.getElementById(id);
const IFRAME_ALLOW="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";

export const cardHTML=v=>'<img class="th" src="'+videoThumb(v.id)+'" alt="" loading="lazy" onload="this.parentNode.classList.add(\'hasimg\')" onerror="this.remove()"><div class="shade"></div><span class="tipo">Videoclip</span><div class="cc"><h3 class="tt">'+v.t+'</h3><button class="rm" aria-label="Ver '+v.t+'">'+ICON_PLAY+'<span>Ver vídeo</span></button></div>';

export const rowHTML=v=>'<article class="slide vs" role="listitem"><button class="vbtn" data-id="'+v.id+'" aria-label="Reproducir el vídeo '+v.t+'"><img src="'+videoThumb(v.id)+'" alt="" loading="lazy" onerror="this.remove()"><span class="play"></span></button><div class="vcap"><b>'+v.t+'</b><a href="'+videoWatchUrl(v.id)+'" target="_blank" rel="noopener">Abrir en YouTube</a></div></article>';

/* En la vista "ver todos", sustituye la miniatura por el reproductor. */
export function playInline(btn){
 const f=document.createElement("iframe");
 f.src=videoEmbedUrl(btn.dataset.id);
 f.title=btn.getAttribute("aria-label").replace("Reproducir el vídeo ","");
 f.allow=IFRAME_ALLOW;
 f.allowFullscreen=true;
 btn.closest(".slide")._btn=btn;btn.replaceWith(f);f.focus();
}

/* Pop up de reproducción de un vídeo. */
export const videoDialogView={
 el:$("vdlg"),prev:$("vprev"),next:$("vnext"),close:$("vdx"),
 render(v){
  $("vtt").textContent=v.t;
  $("vpv").innerHTML='<iframe src="'+videoEmbedUrl(v.id)+'" title="'+v.t+'" allow="'+IFRAME_ALLOW+'" allowfullscreen></iframe>';
 },
 open(){if(!this.el.open)this.el.showModal()},
 hide(){this.el.close()},
 isOpen(){return this.el.open},
 clear(){$("vpv").innerHTML=""}
};
