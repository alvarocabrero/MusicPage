/* Vista: carrusel tipo escenario (tarjetas en anillo + lista "ver todos"). Sólo pinta; no guarda estado. */
import {stageColors} from "../models/theme.js";
import {t} from "../models/i18n.js";
import {ICON_LIST,ICON_CAROUSEL} from "./icons.js";

export function createCarouselView(el,{n,m,card,row}){
 const stage=el.querySelector(".stage"),sec=el.closest("section"),vt=sec.querySelector(".vt");

 stage.innerHTML='<div class="ring" aria-hidden="true"></div>';
 const ring=stage.firstChild,sl=[];
 for(let j=0;j<m;j++){
  const i=j%n,c=document.createElement("article");
  c.className="cd c"+(i%4);c.dataset.j=j;c.style.setProperty("--j",j);c.dataset.idx=i;
  c.setAttribute("role","group");c.setAttribute("aria-roledescription",t("slide"));c.setAttribute("aria-label",t("slideOf",{i:i+1,n:n}));
  c.innerHTML=card(i);stage.appendChild(c);sl.push(c);
 }
 const lst=document.createElement("div");lst.className="lst";lst.setAttribute("role","list");
 for(let k=0;k<n;k++)lst.insertAdjacentHTML("beforeend",row(k));
 el.appendChild(lst);

 function metrics(){
  const cw=el.clientWidth,mob=cw<=820,H=mob?Math.min(400,Math.round(cw*1.02)):Math.min(460,Math.round(cw*.36));
  return {H:H,W:mob?Math.round(cw*.6):Math.round(H*1.55),N:mob?Math.round(cw*.3):Math.round(H*.55),G:mob?12:24,x0:Math.round(cw*(mob?.09:.08))};
 }
 const X=(k,M)=>k===0?M.x0:(k>0?M.x0+M.W+M.G+(k-1)*(M.N+M.G):M.x0+k*(M.N+M.G));
 const Wd=(k,M)=>k===0?M.W:M.N;
 let lastH=-1;

 return {
  el,stage,vt,
  /* Recoloca todas las tarjetas según la posición continua. Se llama en cada fotograma de la animación,
     así que no usa transiciones CSS: la suavidad la da la interpolación del controlador. */
  layout(pos){
   const M=metrics();
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
  unit(){const M=metrics();return (M.W+M.N+2*M.G)/2},
  /* Accesibilidad de la tarjeta activa y color de la sección. */
  state(act,all){
   sl.forEach((s,j)=>{const on=j===act;s.setAttribute("aria-hidden",on?"false":"true");s.querySelectorAll("button,a").forEach(x=>{x.tabIndex=on?0:-1})});
   if(!all)this.paint(act);
  },
  paint(act){
   const c=stageColors(act,n);
   sec.style.setProperty("--sbg",c.bg);sec.style.setProperty("--sfg",c.fg);sec.style.setProperty("--dash",c.dash);
  },
  /* Alterna entre el carrusel y la lista completa. */
  setAll(all){
   el.classList.toggle("all",all);const l=all?t("viewCarousel"):t("viewAll");vt.innerHTML=all?ICON_CAROUSEL:ICON_LIST;vt.setAttribute("aria-label",l);vt.title=l;
   if(all){const cs=getComputedStyle(document.body);sec.style.setProperty("--sbg",cs.backgroundColor);sec.style.setProperty("--sfg",cs.color);sec.style.setProperty("--dash","")}
  },
  /* Tarjeta bajo el puntero, o null. */
  cardAt(target){const c=target.closest(".cd");return c?{j:+c.dataset.j}:null},
  /* Posición relativa (respecto al centro) de la tarjeta j. */
  offsetOf(j){return sl[j]._r},
  setDragging(on){stage.classList.toggle("dragging",on)},
  setRingDrag(on){ring.classList.toggle("drag",on)},
  moveRing(clientX,clientY){const r=stage.getBoundingClientRect();ring.style.transform="translate("+(clientX-r.left)+"px,"+(clientY-r.top)+"px) translate(-50%,-50%)"},
  /* Restaura las miniaturas de vídeo que se hubieran sustituido por el reproductor. */
  stopVideos(){el.querySelectorAll(".slide").forEach(s=>{if(s._btn){const f=s.querySelector("iframe");if(f)f.replaceWith(s._btn);s._btn=null}})},
  onScreen(){const r=el.getBoundingClientRect();return !(r.bottom<0||r.top>innerHeight)}
 };
}
