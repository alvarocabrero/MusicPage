/* Vista: merch (tarjetas del carrusel, filas de "ver todos" y pop up de producto).
   El pop up muestra la foto principal, miniaturas para cambiar de foto (si hay varias), la descripción,
   el texto de envíos y el botón de compra. Los textos de merch.js se insertan tal cual en el HTML. */
import {ICON_GO} from "./icons.js";
import {MERCH_ENVIO} from "../models/merch.js";
import {t,tr} from "../models/i18n.js";

/** Atajo de document.getElementById. @param {string} id @returns {HTMLElement} */
const $=id=>document.getElementById(id);
/** Atributos de las fotos: igual que en releaseView (marca .hasimg al cargar; quita la imagen si falla). */
const IMG_LOAD='onload="this.parentNode.classList.add(\'hasimg\')" onerror="this.remove()"';
/** Foto principal del producto (la primera). @param {import("../models/merch.js").MerchItem} m @returns {string} */
const cover=m=>(m.imgs&&m.imgs[0])||"";
/** Tipo de producto traducido ("CD", "Vinilo", "Camiseta"). @param {import("../models/merch.js").MerchItem} m @returns {string} */
const kind=m=>t("kind."+m.k);

/**
 * Interior de la tarjeta del carrusel: foto de fondo, degradado, etiqueta del tipo, nombre, precio y botón "Ver producto".
 * @param {import("../models/merch.js").MerchItem} m
 * @returns {string} HTML.
 */
export const cardHTML=m=>'<img class="th" src="'+cover(m)+'" alt="'+tr(m.t)+'" loading="lazy" '+IMG_LOAD+'><div class="shade"></div><span class="tipo">'+kind(m)+'</span><div class="cc"><h3 class="tt">'+tr(m.t)+'</h3><div class="meta">'+tr(m.p)+'</div><button class="rm" aria-label="'+t("merch.viewAria",{t:tr(m.t)})+'">'+ICON_GO+'<span>'+t("merch.view")+'</span></button></div>';

/**
 * Fila de la vista de lista: foto (botón), tipo, nombre, precio y botón "Ver producto"; los dos botones llevan
 * data-i, que merchController usa para abrir el pop up.
 * @param {import("../models/merch.js").MerchItem} m
 * @param {number} i Índice del producto en MERCH.
 * @returns {string} HTML.
 */
export const rowHTML=(m,i)=>'<article class="slide rs" role="listitem"><button class="cover c'+(i%4)+'" data-i="'+i+'" aria-label="'+t("merch.viewAria",{t:tr(m.t)})+'"><img class="cv" src="'+cover(m)+'" alt="" loading="lazy" '+IMG_LOAD+'><span>'+tr(m.t)+'</span></button><div class="info"><span class="tipo">'+kind(m)+'</span><h3>'+tr(m.t)+'</h3><div class="meta">'+tr(m.p)+'</div><button class="abrir" data-i="'+i+'">'+t("merch.view")+'</button></div></article>';

/**
 * Cuerpo del pop up de producto: foto principal (.mp), miniaturas (.mt, sólo con varias fotos; la primera marcada
 * con .on), descripción (.md), envíos (.me) y botón de compra (si hay url; texto según cta).
 * @param {import("../models/merch.js").MerchItem} m
 * @returns {string} HTML.
 */
function bodyHTML(m){
 const im=m.imgs||[];
 const th=im.length>1?'<div class="mt">'+im.map((s,i)=>'<button type="button" class="'+(i?'':'on')+'" data-s="'+s+'" aria-label="'+t("photo",{i:i+1,n:im.length})+'"><img src="'+s+'" alt="" loading="lazy"></button>').join("")+'</div>':"";
 return '<div class="mp">'+(im[0]?'<img src="'+im[0]+'" alt="'+tr(m.t)+'">':'')+'</div>'+th+(m.d?'<p class="md">'+tr(m.d)+'</p>':'')+'<p class="me">'+tr(MERCH_ENVIO)+'</p>'+(m.url?'<a class="abrir" href="'+m.url+'" target="_blank" rel="noopener">'+t(m.cta||"buy")+'</a>':'');
}

/* Pop up de producto. */
/* Misma interfaz que los otros pop ups (ver releaseDialogView), más body (contenedor del cuerpo) y showPhoto(). */
export const merchDialogView={
 el:$("mdlg"),prev:$("mprev"),next:$("mnext"),close:$("mx"),body:$("mbody"),
 /**
  * Rellena el pop up: nombre, "Tipo · Precio" y cuerpo.
  * @param {import("../models/merch.js").MerchItem} m
  */
 render(m){
  $("mt").textContent=tr(m.t);
  $("mm").textContent=kind(m)+(m.p?" · "+tr(m.p):"");
  this.body.innerHTML=bodyHTML(m);
 },
 /* Muestra en la foto principal la miniatura pulsada. */
 /** @param {HTMLButtonElement} btn Miniatura pulsada (su data-s es la ruta de la foto). */
 showPhoto(btn){
  this.body.querySelector(".mp img").src=btn.dataset.s;
  this.body.querySelectorAll(".mt button").forEach(x=>x.classList.toggle("on",x===btn));
 },
 /** Abre el pop up como modal (si no lo estaba ya). */
 open(){if(!this.el.open)this.el.showModal()},
 /** Cierra el pop up. */
 hide(){this.el.close()},
 /** @returns {boolean} true si está abierto. */
 isOpen(){return this.el.open},
 /** Vacía el cuerpo al cerrar. */
 clear(){this.body.innerHTML=""}
};
