/* Vista: videoclips (tarjetas del carrusel, filas de "ver todos", reproductor en línea y pop up). */
import {ICON_PLAY} from "./icons.js";
import {t} from "../models/i18n.js";
import {videoThumb,videoThumbFallbacks,videoEmbedUrl,videoWatchUrl} from "../models/videos.js";

const $=id=>document.getElementById(id);
/* Miniaturas: si falta la de alta resolución, YouTube devuelve una imagen genérica de 120 px que "carga bien",
   así que se comprueba el tamaño al cargar; si es demasiado pequeña (o falla) se prueba la siguiente de data-fb. */
const NEXT="var a=this.dataset.fb.split('|');this.dataset.fb=a.slice(1).join('|');this.src=a[0]";
const THUMB_LOAD="if(this.naturalWidth<=120&&this.dataset.fb){"+NEXT+"}else this.parentNode.classList.add('hasimg')";
const THUMB_ERR="if(this.dataset.fb){"+NEXT+"}else this.remove()";
const thumbImg=(v,cls)=>'<img '+cls+' alt="" src="'+videoThumb(v.id)+'" data-fb="'+videoThumbFallbacks(v.id).join("|")+'" loading="lazy" onload="'+THUMB_LOAD+'" onerror="'+THUMB_ERR+'">';
const IFRAME_ALLOW="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";

export const cardHTML=v=>thumbImg(v,'class="th"')+'<div class="shade"></div><span class="tipo">'+t("video.tag")+'</span><div class="cc"><h3 class="tt">'+v.t+'</h3><button class="rm" aria-label="'+t("video.watchAria",{t:v.t})+'">'+ICON_PLAY+'<span>'+t("video.watch")+'</span></button></div>';

export const rowHTML=v=>'<article class="slide vs" role="listitem"><button class="vbtn" data-id="'+v.id+'" data-title="'+v.t+'" aria-label="'+t("video.play",{t:v.t})+'">'+thumbImg(v,'')+'<span class="play"></span></button><div class="vcap"><b>'+v.t+'</b><a href="'+videoWatchUrl(v.id)+'" target="_blank" rel="noopener">'+t("video.openYT")+'</a></div></article>';

/* En la vista "ver todos", sustituye la miniatura por el reproductor. */
export function playInline(btn){
 const f=document.createElement("iframe");
 f.src=videoEmbedUrl(btn.dataset.id);
 f.title=btn.dataset.title;
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
