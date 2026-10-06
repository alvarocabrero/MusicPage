/* Vista: discos (tarjetas del carrusel, filas de "ver todos", portada y pop up de preescucha).
   Genera el HTML a partir de un disco de releases.js. Los textos de datos se insertan tal cual en el HTML,
   así que los títulos y nombres de releases.js no deben llevar "<" ni comillas dobles. */
import {ICON_GO,PICON} from "./icons.js";
import {linksFor} from "../models/platforms.js";
import {linkAttrs} from "../models/appLinks.js";
import {t,tr} from "../models/i18n.js";

/** Atajo de document.getElementById. @param {string} id @returns {HTMLElement} */
const $=id=>document.getElementById(id);
/** Atributos de las portadas: al cargar, la tarjeta o la portada de la lista (.cd / .cover) recibe .hasimg (oculta el
 *  fondo de color); si la imagen falla se quita y queda la tarjeta de color con el título. */
const IMG_LOAD='onload="this.closest(\'.cd,.cover\').classList.add(\'hasimg\')" onerror="this.remove()"';

/** Tipo de disco traducido ("Álbum", "EP"). @param {import("../models/releases.js").Release} r @returns {string} */
const kind=r=>t("kind."+r.k);
/* Espacios de no separación: los nombres y las fechas no se parten entre líneas y ninguna línea empieza por "&" o "·". */
/** nb: cambia los espacios por espacios de no separación (U+00A0). SEP: separador " · " que sólo deja saltar
 *  de línea después del punto. @param {string} s @returns {string} */
const nb=s=>s.replace(/ /g,"\u00a0"),SEP="\u00a0· ";
/* Todos los artistas principales: "A", "A & B", "A, B & C". */
/** @param {import("../models/releases.js").Release} r @returns {string} Artistas unidos, sin partir los nombres. */
const artists=r=>{const a=[].concat(r.a).map(nb);return a.length>1?a.slice(0,-1).join(", ")+"\u00a0& "+a[a.length-1]:a[0]};
/** Año de salida, sin partir. @param {import("../models/releases.js").Release} r @returns {string} */
const date=r=>nb(tr(r.y));
/** Línea de datos de las tarjetas: "Artistas · Año". @param {import("../models/releases.js").Release} r @returns {string} */
const info=r=>artists(r)+SEP+date(r);
/* "9 canciones" (sin partir) para números; los textos libres vienen ya traducidos. */
/** Dato extra de la vista de lista (canciones o texto libre). @param {import("../models/releases.js").Release} r @returns {string} */
const extra=r=>typeof r.n==="number"?nb(t("tracks",{n:r.n})):tr(r.n);

/**
 * Interior de la tarjeta del carrusel: portada de fondo, degradado (.shade), etiqueta del tipo, título,
 * "Artistas · Año" y botón "Escuchar" (abre el pop up; ver carouselController).
 * La portada es de 1200×1200: la tarjeta activa mide unos 714 px de ancho en el ordenador y, en el móvil, la imagen
 * ocupa unos 400 px de alto con pantallas de 2 o 3 píxeles por punto; con menos resolución se vería estirada.
 * @param {import("../models/releases.js").Release} r
 * @returns {string} HTML.
 */
export const cardHTML=r=>'<img class="th" src="img/'+r.img+'.webp" alt="'+t("release.cover",{t:r.t})+'" loading="lazy" '+IMG_LOAD+'><div class="shade"></div><span class="tipo">'+kind(r)+'</span><div class="cc"><h3 class="tt">'+r.t+'</h3><div class="meta">'+info(r)+'</div><button class="rm" aria-label="'+t("listen")+' '+r.t+'">'+ICON_GO+'<span>'+t("listen")+'</span></button></div>';

/**
 * Fila de la vista de lista: portada (botón que abre el pop up), tipo, título, "Artistas · Año · canciones"
 * y botón "Escuchar". Ambos botones llevan data-i, que releasesController usa para abrir el pop up.
 * @param {import("../models/releases.js").Release} r
 * @param {number} i Índice del disco en RELEASES.
 * @returns {string} HTML.
 */
export const rowHTML=(r,i)=>'<article class="slide rs" role="listitem"><button class="cover c'+(i%4)+'" data-i="'+i+'" aria-label="'+t("release.open",{t:r.t})+'"><img class="cv" src="img/'+r.img+'.webp" alt="" loading="lazy" '+IMG_LOAD+'><span>'+r.t+'</span></button><div class="info"><span class="tipo">'+kind(r)+'</span><h3>'+r.t+'</h3><div class="meta">'+info(r)+SEP+extra(r)+'</div><button class="abrir" data-i="'+i+'">'+t("listen")+'</button></div></article>';

/**
 * Reproductor de Spotify incrustado (preescucha del álbum), sólo si el disco tiene sp.
 * @param {import("../models/releases.js").Release} r
 * @returns {string} HTML del iframe, o "" si no hay ID de Spotify.
 */
const embedHTML=r=>r.sp?'<iframe src="https://open.spotify.com/embed/album/'+r.sp+'?utm_source=generator" title="'+t("release.preview",{t:r.t})+'" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>':'';

/* data-p y data-web los usa el controlador de apps para abrir la app de escritorio. */
/**
 * Etiqueta de apertura del enlace a una plataforma (el href depende del dispositivo; ver appLinks.js).
 * @param {{p:import("../models/platforms.js").Platform,url:string}} x Plataforma y URL web.
 * @returns {string} HTML de la etiqueta <a …> (sin cerrar).
 */
const linkHTML=x=>{const l=linkAttrs(x.p.id,x.url);return '<a href="'+l.href+'" data-p="'+x.p.id+'" data-web="'+x.url+'"'+(l.blank?' target="_blank"':'')+' rel="noopener">'};
/**
 * Botones de las plataformas del disco (logo y nombre), como elementos <li> de la lista .plats.
 * @param {import("../models/releases.js").Release} r
 * @returns {string} HTML.
 */
const linksHTML=r=>linksFor(r).map(x=>'<li>'+linkHTML(x)+'<b>'+PICON[x.p.id]+x.p.n+'</b></a></li>').join("");

/* Portada: logo + último lanzamiento con preescucha y enlaces. index.html ya trae este bloque escrito (lo genera
   tools/portada.mjs con esta misma función), para que la portada salga completa sin esperar a JavaScript. */
export const heroView={
 /**
  * Pinta en #hrel el bloque del último lanzamiento: etiqueta, título, "Artistas · Tipo · Año", hueco de la
  * preescucha (.hp; con .sp si el disco tiene Spotify, para reservar su alto) y botones de plataformas.
  * El reproductor no va aquí: lo pone loadPlayer().
  * @param {import("../models/releases.js").Release} r
  */
 render(r){
  $("hrel").innerHTML='<span class="tipo">'+t("release.latest")+'</span><h2>'+r.t+'</h2><p class="hm">'+artists(r)+SEP+kind(r)+SEP+date(r)+'</p><div class="hp'+(r.sp?' sp':'')+'"></div><ul class="plats">'+linksHTML(r)+'</ul>';
 },
 /**
  * Pone el reproductor de Spotify en el hueco reservado de la portada.
  * @param {import("../models/releases.js").Release} r
  */
 loadPlayer(r){const h=$("hrel").querySelector(".hp");if(h&&!h.firstChild)h.innerHTML=embedHTML(r)}
};

/* Pop up de preescucha de un disco. */
/* Misma interfaz que videoDialogView y merchDialogView, para que dialogController sirva para los tres:
   el (el <dialog>), prev/next/close (botones), render(item), open(), hide(), isOpen() y clear(). */
export const releaseDialogView={
 el:$("dlg"),prev:$("dprev"),next:$("dnext"),close:$("dx"),
 /**
  * Rellena el pop up con un disco: título, "Artistas · Tipo · Año", preescucha y plataformas.
  * @param {import("../models/releases.js").Release} r
  */
 render(r){
  $("dt").textContent=r.t;
  $("dm").textContent=artists(r)+SEP+kind(r)+SEP+date(r);
  $("dpv").innerHTML=embedHTML(r);
  $("dpl").innerHTML=linksHTML(r);
 },
 /** Abre el pop up como modal (si no lo estaba ya: al navegar con las flechas sólo se cambia el contenido). */
 open(){if(!this.el.open)this.el.showModal()},
 /** Cierra el pop up. */
 hide(){this.el.close()},
 /** @returns {boolean} true si está abierto. */
 isOpen(){return this.el.open},
 /** Quita la preescucha al cerrar, para que deje de sonar. */
 clear(){$("dpv").innerHTML=""}
};
