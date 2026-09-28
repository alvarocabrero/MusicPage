/* Vista: merch (tarjetas del carrusel, filas de "ver todos" y pop up de producto). */
import {ICON_GO} from "./icons.js";
import {MERCH_ENVIO} from "../models/merch.js";

const $=id=>document.getElementById(id);
const IMG_LOAD='onload="this.parentNode.classList.add(\'hasimg\')" onerror="this.remove()"';
const cover=m=>(m.imgs&&m.imgs[0])||"";

export const cardHTML=m=>'<img class="th" src="'+cover(m)+'" alt="'+m.t+'" loading="lazy" '+IMG_LOAD+'><div class="shade"></div><span class="tipo">'+m.k+'</span><div class="cc"><h3 class="tt">'+m.t+'</h3><div class="meta">'+(m.p||"")+'</div><button class="rm" aria-label="Ver '+m.t+'">'+ICON_GO+'<span>Ver producto</span></button></div>';

export const rowHTML=(m,i)=>'<article class="slide rs" role="listitem"><button class="cover c'+(i%4)+'" data-i="'+i+'" aria-label="Ver '+m.t+'"><img class="cv" src="'+cover(m)+'" alt="" loading="lazy" '+IMG_LOAD+'><span>'+m.t+'</span></button><div class="info"><span class="tipo">'+m.k+'</span><h3>'+m.t+'</h3><div class="meta">'+(m.p||"")+'</div><button class="abrir" data-i="'+i+'">Ver producto</button></div></article>';

function bodyHTML(m){
 const im=m.imgs||[];
 const th=im.length>1?'<div class="mt">'+im.map((s,i)=>'<button type="button" class="'+(i?'':'on')+'" data-s="'+s+'" aria-label="Ver foto '+(i+1)+' de '+im.length+'"><img src="'+s+'" alt="" loading="lazy"></button>').join("")+'</div>':"";
 return '<div class="mp">'+(im[0]?'<img src="'+im[0]+'" alt="'+m.t+'">':'')+'</div>'+th+(m.d?'<p class="md">'+m.d+'</p>':'')+'<p class="me">'+MERCH_ENVIO+'</p>'+(m.url?'<a class="abrir" href="'+m.url+'" target="_blank" rel="noopener">'+(m.cta||"Comprar")+'</a>':'');
}

/* Pop up de producto. */
export const merchDialogView={
 el:$("mdlg"),prev:$("mprev"),next:$("mnext"),close:$("mx"),body:$("mbody"),
 render(m){
  $("mt").textContent=m.t;
  $("mm").textContent=m.k+(m.p?" · "+m.p:"");
  this.body.innerHTML=bodyHTML(m);
 },
 /* Muestra en la foto principal la miniatura pulsada. */
 showPhoto(btn){
  this.body.querySelector(".mp img").src=btn.dataset.s;
  this.body.querySelectorAll(".mt button").forEach(x=>x.classList.toggle("on",x===btn));
 },
 open(){if(!this.el.open)this.el.showModal()},
 hide(){this.el.close()},
 isOpen(){return this.el.open},
 clear(){this.body.innerHTML=""}
};
