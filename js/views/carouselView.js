/* Vista: carrusel tipo escenario (tarjetas en anillo + lista "ver todos"). Sólo pinta; no guarda estado.
   Crea las m tarjetas del anillo dentro de .stage y la lista completa (.lst) al final del contenedor .car.
   Las tarjetas se colocan con posición absoluta: una grande a la izquierda (la activa) y las demás estrechas
   a su derecha y a su izquierda; layout(pos) las recoloca para cualquier posición continua, también intermedia,
   de modo que el controlador puede animar el paso de una tarjeta a otra fotograma a fotograma.
   Medidas (ver metrics): H alto de las tarjetas, W ancho de la activa, N ancho de las laterales, G separación
   y x0 borde izquierdo de la activa. En móvil (≤ 820 px) dependen del ancho; en ordenador, del alto H. */
import {stageColors} from "../models/theme.js";
import {t} from "../models/i18n.js";
import {ICON_LIST,ICON_CAROUSEL} from "./icons.js";

/**
 * Crea la vista de un carrusel.
 * @param {HTMLElement} el Contenedor .car (tiene dentro el .stage); su sección lleva el botón .vt de "Ver lista".
 * @param {Object} o
 * @param {number} o.n Número de elementos reales.
 * @param {number} o.m Número de tarjetas del anillo (múltiplo de n; ver CarouselModel).
 * @param {function(number):string} o.card HTML del interior de la tarjeta del elemento i.
 * @param {function(number):string} o.row HTML de la fila del elemento i en la vista de lista.
 * @returns {Object} Vista con las funciones que usa carouselController (layout, state, setAll…).
 */
export function createCarouselView(el,{n,m,card,row}){
 const stage=el.querySelector(".stage"),sec=el.closest("section"),vt=sec.querySelector(".vt");

 /* El anillo (.ring) es el cursor circular que sigue al ratón por el escenario (sólo con ratón; ver carousel.css).
    Cada tarjeta lleva: data-j (posición en el anillo), data-idx (elemento real), --j (desfase de la animación
    de "flotar") y la clase c0..c3 (color de fondo mientras no hay imagen). */
 stage.innerHTML='<div class="ring" aria-hidden="true"></div>';
 const ring=stage.firstChild,sl=[];
 for(let j=0;j<m;j++){
  const i=j%n,c=document.createElement("article");
  c.className="cd c"+(i%4);c.dataset.j=j;c.style.setProperty("--j",j);c.dataset.idx=i;
  c.setAttribute("role","group");c.setAttribute("aria-roledescription",t("slide"));c.setAttribute("aria-label",t("slideOf",{i:i+1,n:n}));
  c.innerHTML=card(i);stage.appendChild(c);sl.push(c);
 }
 /* Vista de lista: una fila por elemento real (sin repeticiones); se muestra con la clase .all en .car. */
 const lst=document.createElement("div");lst.className="lst";lst.setAttribute("role","list");
 for(let k=0;k<n;k++)lst.insertAdjacentHTML("beforeend",row(k));
 el.appendChild(lst);

 /**
  * Medidas del carrusel para el tamaño actual de la pantalla (se recalculan en cada fotograma: son baratas
  * y así responden al instante a un cambio de tamaño o de orientación).
  * @returns {{H:number,W:number,N:number,G:number,x0:number}} Alto de las tarjetas, ancho de la activa,
  *   ancho de las laterales, separación entre tarjetas y posición izquierda de la activa (px).
  */
 function metrics(){
  /* En pantallas bajas (móvil en horizontal) la tarjeta no pasa del alto que queda bajo la cabecera, para verse entera. */
  const cw=el.clientWidth,mob=cw<=820,vh=document.documentElement.clientHeight,
   H=Math.min(mob?Math.min(400,Math.round(cw*1.02)):Math.min(460,Math.round(cw*.36)),Math.max(180,vh-108));
  return {H:H,W:mob?Math.round(cw*.6):Math.round(H*1.55),N:mob?Math.round(cw*.3):Math.round(H*.55),G:mob?12:24,x0:Math.round(cw*(mob?.09:.08))};
 }
 /**
  * Posición izquierda del hueco k: 0 es la activa, 1, 2… las de su derecha y −1, −2 las de su izquierda.
  * @param {number} k Hueco (entero).
  * @param {Object} M Medidas de metrics().
  * @returns {number} px desde el borde izquierdo del escenario.
  */
 const X=(k,M)=>k===0?M.x0:(k>0?M.x0+M.W+M.G+(k-1)*(M.N+M.G):M.x0+k*(M.N+M.G));
 /**
  * Ancho del hueco k: la activa es ancha (W) y el resto estrechas (N).
  * @param {number} k
  * @param {Object} M
  * @returns {number}
  */
 const Wd=(k,M)=>k===0?M.W:M.N;
 /* Último alto aplicado al escenario, para no reescribirlo en cada fotograma. */
 let lastH=-1;

 return {
  /** Escenario .stage y botón "Ver lista" de la sección (el controlador escucha sus eventos). */
  stage,vt,
  /* Recoloca todas las tarjetas según la posición continua. Se llama en cada fotograma de la animación,
     así que no usa transiciones CSS: la suavidad la da la interpolación del controlador. */
  /**
   * Cada tarjeta j queda a r = j − pos huecos de la activa (ajustado al anillo para que r esté entre −2 y m−2:
   * siempre hay dos tarjetas a la izquierda y el resto a la derecha). Con r fraccionario se interpola entre los
   * huecos vecinos. --k (1 en la activa y 0 desde un hueco de distancia) agranda el título en CSS y la clase
   * .on marca la tarjeta más centrada.
   * @param {number} pos Posición continua del carrusel (la del muelle del controlador).
   */
  layout(pos){
   const M=metrics();
   /* Alto del escenario: la tarjeta (H) más 30 px arriba y 54 px abajo para la sombra y el vaivén. */
   if(M.H!==lastH){stage.style.height=(M.H+84)+"px";lastH=M.H}
   sl.forEach((s,j)=>{
    const r=(((j-pos+2)%m)+m)%m-2,k=Math.floor(r),f=r-k,
     x=X(k,M)+(X(k+1,M)-X(k,M))*f,w=Wd(k,M)+(Wd(k+1,M)-Wd(k,M))*f;
    s._r=r;
    s.style.left=x.toFixed(2)+"px";s.style.width=w.toFixed(2)+"px";s.style.height=M.H+"px";
    s.style.setProperty("--k",Math.max(0,1-Math.abs(r)).toFixed(3));
    s.classList.toggle("on",Math.abs(r)<.5);
   });
  },
  /* Distancia (en px) que equivale a una tarjeta al arrastrar. */
  /** @returns {number} px de arrastre por tarjeta (media entre el paso hacia una tarjeta ancha y hacia una estrecha). */
  unit(){const M=metrics();return (M.W+M.N+2*M.G)/2},
  /* Accesibilidad de la tarjeta activa y color de la sección. */
  /**
   * Sólo la tarjeta activa es visible para lectores de pantalla y alcanzable con el tabulador.
   * @param {number} act Índice de la tarjeta activa.
   * @param {boolean} all true si se está en la vista de lista (entonces no se cambian los colores).
   */
  state(act,all){
   sl.forEach((s,j)=>{const on=j===act;s.setAttribute("aria-hidden",on?"false":"true");s.querySelectorAll("button,a").forEach(x=>{x.tabIndex=on?0:-1})});
   if(!all)this.paint(act);
  },
  /**
   * Pone en la sección los colores de la tarjeta activa (variables --sbg, --sfg y --dash; la transición está en CSS).
   * @param {number} act Índice de la tarjeta activa.
   */
  paint(act){
   const c=stageColors(act,n);
   sec.style.setProperty("--sbg",c.bg);sec.style.setProperty("--sfg",c.fg);sec.style.setProperty("--dash",c.dash);
  },
  /* Alterna entre el carrusel y la lista completa. */
  /**
   * Cambia el icono y el texto del botón y, en la lista, devuelve a la sección los colores normales de la página.
   * @param {boolean} all true para mostrar la lista.
   */
  setAll(all){
   el.classList.toggle("all",all);const l=all?t("viewCarousel"):t("viewAll");vt.innerHTML=all?ICON_CAROUSEL:ICON_LIST;vt.setAttribute("aria-label",l);vt.title=l;
   if(all){const cs=getComputedStyle(document.body);sec.style.setProperty("--sbg",cs.backgroundColor);sec.style.setProperty("--sfg",cs.color);sec.style.setProperty("--dash","")}
  },
  /* Tarjeta bajo el puntero, o null. */
  /**
   * @param {Element} target Elemento sobre el que se ha hecho clic.
   * @returns {{j:number}|null} Índice en el anillo de la tarjeta que lo contiene.
   */
  cardAt(target){const c=target.closest(".cd");return c?{j:+c.dataset.j}:null},
  /* Posición relativa (respecto al centro) de la tarjeta j. */
  /**
   * @param {number} j Índice en el anillo.
   * @returns {number} Huecos de distancia a la activa en el último layout (negativo = a la izquierda).
   */
  offsetOf(j){return sl[j]._r},
  /** Agranda el cursor circular mientras se arrastra. @param {boolean} on */
  setRingDrag(on){ring.classList.toggle("drag",on)},
  /**
   * Lleva el cursor circular a la posición del puntero.
   * @param {number} clientX
   * @param {number} clientY
   */
  moveRing(clientX,clientY){const r=stage.getBoundingClientRect();ring.style.transform="translate("+(clientX-r.left)+"px,"+(clientY-r.top)+"px) translate(-50%,-50%)"},
  /* Restaura las miniaturas de vídeo que se hubieran sustituido por el reproductor. */
  /** Lo usa el controlador al cambiar de vista, para que no siga sonando un vídeo de la lista. */
  stopVideos(){el.querySelectorAll(".slide").forEach(s=>{if(s._btn){const f=s.querySelector("iframe");if(f)f.replaceWith(s._btn);s._btn=null}})},
  /** @returns {boolean} true si alguna parte del carrusel está en pantalla (el avance automático sólo corre entonces). */
  onScreen(){const r=el.getBoundingClientRect();return !(r.bottom<0||r.top>innerHeight)}
 };
}
