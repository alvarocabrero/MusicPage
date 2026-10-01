/* Vista: videoclips (tarjetas del carrusel, filas de "ver todos", reproductor en línea y pop up).
   En el carrusel, "Ver vídeo" abre el pop up con el reproductor; en la vista de lista, cada fila muestra la miniatura
   y al pulsarla se sustituye por el reproductor en la propia fila (playInline). Los vídeos se incrustan desde
   youtube-nocookie.com. Los títulos de videos.js se insertan tal cual en el HTML (sin "<" ni comillas dobles). */
import {ICON_PLAY} from "./icons.js";
import {t} from "../models/i18n.js";
import {videoThumb,videoThumbFallbacks,videoEmbedUrl,videoWatchUrl} from "../models/videos.js";

/** Atajo de document.getElementById. @param {string} id @returns {HTMLElement} */
const $=id=>document.getElementById(id);
/* Miniaturas: si falta la de alta resolución, YouTube devuelve una imagen genérica de 120 px que "carga bien",
   así que se comprueba el tamaño al cargar; si es demasiado pequeña (o falla) se prueba la siguiente de data-fb. */
/* Son código de los atributos onload/onerror (cadenas, porque las tarjetas se generan como HTML):
   NEXT pasa a la siguiente URL de data-fb (lista separada por "|") y la quita de la lista;
   THUMB_LOAD, al cargar, pasa a la siguiente si es la genérica de 120 px o, si vale, marca la tarjeta con .hasimg;
   THUMB_ERR, si falla, prueba la siguiente o, si no quedan, quita la imagen (queda la tarjeta de color). */
const NEXT="var a=this.dataset.fb.split('|');this.dataset.fb=a.slice(1).join('|');this.src=a[0]";
const THUMB_LOAD="if(this.naturalWidth<=120&&this.dataset.fb){"+NEXT+"}else this.parentNode.classList.add('hasimg')";
const THUMB_ERR="if(this.dataset.fb){"+NEXT+"}else this.remove()";
/**
 * Imagen de la miniatura de un vídeo, con sus respaldos en data-fb y carga diferida.
 * @param {import("../models/videos.js").Video} v
 * @param {string} cls Atributo de clase ('class="th"' en las tarjetas) o "".
 * @returns {string} HTML del <img>.
 */
const thumbImg=(v,cls)=>'<img '+cls+' alt="" src="'+videoThumb(v.id)+'" data-fb="'+videoThumbFallbacks(v.id).join("|")+'" loading="lazy" onload="'+THUMB_LOAD+'" onerror="'+THUMB_ERR+'">';
/** Permisos del reproductor incrustado (reproducción automática, pantalla completa, imagen en imagen…). */
const IFRAME_ALLOW="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";

/**
 * Interior de la tarjeta del carrusel: miniatura de fondo, degradado, etiqueta "Videoclip", título y botón "Ver vídeo".
 * @param {import("../models/videos.js").Video} v
 * @returns {string} HTML.
 */
export const cardHTML=v=>thumbImg(v,'class="th"')+'<div class="shade"></div><span class="tipo">'+t("video.tag")+'</span><div class="cc"><h3 class="tt">'+v.t+'</h3><button class="rm" aria-label="'+t("video.watchAria",{t:v.t})+'">'+ICON_PLAY+'<span>'+t("video.watch")+'</span></button></div>';

/**
 * Fila de la vista de lista: botón con la miniatura y el icono de reproducir (.vbtn, con data-id y data-title
 * para playInline) y pie con el título y el enlace "Abrir en YouTube".
 * @param {import("../models/videos.js").Video} v
 * @returns {string} HTML.
 */
export const rowHTML=v=>'<article class="slide vs" role="listitem"><button class="vbtn" data-id="'+v.id+'" data-title="'+v.t+'" aria-label="'+t("video.play",{t:v.t})+'">'+thumbImg(v,'')+'<span class="play"></span></button><div class="vcap"><b>'+v.t+'</b><a href="'+videoWatchUrl(v.id)+'" target="_blank" rel="noopener">'+t("video.openYT")+'</a></div></article>';

/* En la vista "ver todos", sustituye la miniatura por el reproductor. */
/**
 * El botón se guarda en la fila (._btn) para que carouselView.stopVideos() pueda volver a ponerlo
 * y parar el vídeo al cambiar de vista.
 * @param {HTMLButtonElement} btn Botón .vbtn pulsado.
 */
export function playInline(btn){
 const f=document.createElement("iframe");
 f.src=videoEmbedUrl(btn.dataset.id);
 f.title=btn.dataset.title;
 f.allow=IFRAME_ALLOW;
 f.allowFullscreen=true;
 btn.closest(".slide")._btn=btn;btn.replaceWith(f);f.focus();
}

/* Pop up de reproducción de un vídeo. */
/* Misma interfaz que los otros pop ups (ver releaseDialogView), para dialogController. */
export const videoDialogView={
 el:$("vdlg"),prev:$("vprev"),next:$("vnext"),close:$("vdx"),
 /**
  * Pone el título y el reproductor (empieza a sonar solo).
  * @param {import("../models/videos.js").Video} v
  */
 render(v){
  $("vtt").textContent=v.t;
  $("vpv").innerHTML='<iframe src="'+videoEmbedUrl(v.id)+'" title="'+v.t+'" allow="'+IFRAME_ALLOW+'" allowfullscreen></iframe>';
 },
 /** Abre el pop up como modal (si no lo estaba ya). */
 open(){if(!this.el.open)this.el.showModal()},
 /** Cierra el pop up. */
 hide(){this.el.close()},
 /** @returns {boolean} true si está abierto. */
 isOpen(){return this.el.open},
 /** Quita el reproductor al cerrar, para que el vídeo deje de sonar. */
 clear(){$("vpv").innerHTML=""}
};
