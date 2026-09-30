/* Vista: discos (tarjetas del carrusel, filas de "ver todos", portada y pop up de preescucha). */
import {ICON_GO,PICON} from "./icons.js";
import {linksFor} from "../models/platforms.js";
import {linkAttrs} from "../models/appLinks.js";
import {t,tr} from "../models/i18n.js";

const $=id=>document.getElementById(id);
const IMG_LOAD='onload="this.parentNode.classList.add(\'hasimg\')" onerror="this.remove()"';

const kind=r=>t("kind."+r.k);
const info=r=>r.a+" · "+tr(r.y);
/* "9 canciones" para números; los textos libres vienen ya traducidos. */
const extra=r=>typeof r.n==="number"?t("tracks",{n:r.n}):tr(r.n);

export const cardHTML=r=>'<img class="th" src="img/'+r.img+'.jpg" alt="'+t("release.cover",{t:r.t})+'" loading="lazy" '+IMG_LOAD+'><div class="shade"></div><span class="tipo">'+kind(r)+'</span><div class="cc"><h3 class="tt">'+r.t+'</h3><div class="meta">'+info(r)+'</div><button class="rm" aria-label="'+t("listen")+' '+r.t+'">'+ICON_GO+'<span>'+t("listen")+'</span></button></div>';

export const rowHTML=(r,i)=>'<article class="slide rs" role="listitem"><button class="cover c'+(i%4)+'" data-i="'+i+'" aria-label="'+t("release.open",{t:r.t})+'"><img class="cv" src="img/'+r.img+'.jpg" alt="" loading="lazy" '+IMG_LOAD+'><span>'+r.t+'</span></button><div class="info"><span class="tipo">'+kind(r)+'</span><h3>'+r.t+'</h3><div class="meta">'+info(r)+' · '+extra(r)+'</div><button class="abrir" data-i="'+i+'">'+t("listen")+'</button></div></article>';

const embedHTML=r=>r.sp?'<iframe src="https://open.spotify.com/embed/album/'+r.sp+'?utm_source=generator" title="'+t("release.preview",{t:r.t})+'" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>':'';

/* data-p y data-web los usa el controlador de apps para abrir la app de escritorio. */
const linkHTML=x=>{const l=linkAttrs(x.p.id,x.url);return '<a class="dir" href="'+l.href+'" data-p="'+x.p.id+'" data-web="'+x.url+'"'+(l.blank?' target="_blank"':'')+' rel="noopener">'};
const linksHTML=r=>linksFor(r).map(x=>'<li>'+linkHTML(x)+'<b>'+PICON[x.p.id]+x.p.n+'</b><span>'+t("listen")+'</span></a></li>').join("");

/* Portada: logo + último lanzamiento con preescucha y enlaces. */
export const heroView={
 render(r){
  $("hrel").innerHTML='<span class="tipo">'+t("release.latest")+'</span><h2>'+r.t+'</h2><p class="hm">'+r.a+' · '+kind(r)+' · '+tr(r.y)+'</p><div class="hp">'+embedHTML(r)+'</div><ul class="plats">'+linksHTML(r)+'</ul>';
 }
};

/* Pop up de preescucha de un disco. */
export const releaseDialogView={
 el:$("dlg"),prev:$("dprev"),next:$("dnext"),close:$("dx"),
 render(r){
  $("dt").textContent=r.t;
  $("dm").textContent=r.a+" · "+kind(r)+" · "+tr(r.y);
  $("dpv").innerHTML=embedHTML(r);
  $("dpl").innerHTML=linksHTML(r);
 },
 open(){if(!this.el.open)this.el.showModal()},
 hide(){this.el.close()},
 isOpen(){return this.el.open},
 clear(){$("dpv").innerHTML=""}
};
