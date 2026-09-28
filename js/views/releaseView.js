/* Vista: discos (tarjetas del carrusel, filas de "ver todos", portada y pop up de preescucha). */
import {ICON_GO,PICON} from "./icons.js";
import {linksFor} from "../models/platforms.js";

const $=id=>document.getElementById(id);
const IMG_LOAD='onload="this.parentNode.classList.add(\'hasimg\')" onerror="this.remove()"';

export const cardHTML=r=>'<img class="th" src="img/'+r.img+'.jpg" alt="Portada de '+r.t+'" loading="lazy" '+IMG_LOAD+'><div class="shade"></div><span class="tipo">'+r.k+'</span><div class="cc"><h3 class="tt">'+r.t+'</h3><div class="meta">'+r.a+' · '+r.y+'</div><button class="rm" aria-label="Escuchar '+r.t+'">'+ICON_GO+'<span>Escuchar</span></button></div>';

export const rowHTML=(r,i)=>'<article class="slide rs" role="listitem"><button class="cover c'+(i%4)+'" data-i="'+i+'" aria-label="Abrir '+r.t+': preescucha y plataformas"><img class="cv" src="img/'+r.img+'.jpg" alt="" loading="lazy" '+IMG_LOAD+'><span>'+r.t+'</span></button><div class="info"><span class="tipo">'+r.k+'</span><h3>'+r.t+'</h3><div class="meta">'+r.a+' · '+r.y+' · '+r.n+'</div><button class="abrir" data-i="'+i+'">Escuchar</button></div></article>';

const embedHTML=r=>r.sp?'<iframe src="https://open.spotify.com/embed/album/'+r.sp+'?utm_source=generator" title="Preescucha de '+r.t+'" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>':'';

const linksHTML=r=>linksFor(r).map(x=>'<li><a class="dir" href="'+x.url+'" target="_blank" rel="noopener"><b>'+PICON[x.p.id]+x.p.n+'</b><span>'+(x.p.l||'Escuchar')+'</span></a></li>').join("");

/* Portada: logo + último lanzamiento con preescucha y enlaces. */
export const heroView={
 render(r){
  $("hrel").innerHTML='<span class="tipo">Último lanzamiento</span><h2>'+r.t+'</h2><p class="hm">'+r.a+' · '+r.k+' · '+r.y+'</p><div class="hp">'+embedHTML(r)+'</div><ul class="plats">'+linksHTML(r)+'</ul>';
 }
};

/* Pop up de preescucha de un disco. */
export const releaseDialogView={
 el:$("dlg"),prev:$("dprev"),next:$("dnext"),close:$("dx"),
 render(r){
  $("dt").textContent=r.t;
  $("dm").textContent=r.a+" · "+r.k+" · "+r.y;
  $("dpv").innerHTML=embedHTML(r);
  $("dpl").innerHTML=linksHTML(r);
 },
 open(){if(!this.el.open)this.el.showModal()},
 hide(){this.el.close()},
 isOpen(){return this.el.open},
 clear(){$("dpv").innerHTML=""}
};
