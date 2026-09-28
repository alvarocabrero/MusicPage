/* Vista: sección de merch. */
const grid=()=>document.getElementById("merch-grid");

function productHTML(m,n,envio){
 const im=m.imgs||[];
 const th=im.length>1?'<div class="mt">'+im.map((s,i)=>'<button type="button" class="'+(i?'':'on')+'" data-s="'+s+'" aria-label="Ver foto '+(i+1)+' de '+im.length+'"><img src="'+s+'" alt="" loading="lazy"></button>').join("")+'</div>':"";
 return '<article class="mi" data-n="'+n+'"><div class="mp">'+(im[0]?'<img src="'+im[0]+'" alt="'+m.t+'" loading="lazy">':'')+'</div>'+th+'<h3>'+m.t+'</h3>'+(m.p?'<div class="pr">'+m.p+'</div>':'')+(m.d?'<p class="md">'+m.d+'</p>':'')+'<p class="me">'+envio+'</p>'+(m.url?'<a class="abrir" href="'+m.url+'" target="_blank" rel="noopener">'+(m.cta||"Comprar")+'</a>':'')+'</article>';
}

export const merchView={
 get grid(){return grid()},
 render(items,envio){
  grid().innerHTML=items.length
   ?items.map((m,n)=>productHTML(m,n,envio)).join("")
   :'<div class="mnone">Próximamente<span>Muy pronto tendremos merch disponible.</span></div>';
 },
 /* Muestra en la foto principal la miniatura pulsada. */
 showPhoto(btn){
  const c=btn.closest(".mi");
  c.querySelector(".mp img").src=btn.dataset.s;
  c.querySelectorAll(".mt button").forEach(x=>x.classList.toggle("on",x===btn));
 }
};
