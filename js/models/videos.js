/* Modelo: videoclips. d = fecha de publicación en YouTube (AAAA-MM-DD). La lista se ordena sola, del más reciente al más antiguo,
   así que los vídeos nuevos pueden añadirse en cualquier posición. */
export const VIDEOS=[
 {id:"NYuIrof_Kdk",t:"Grand Chelem",d:"2026-04-29"},
 {id:"sLtKuVB39J0",t:"Expediciones en La Taiga",d:"2025-11-21"},
 {id:"jdn0HGqiUPY",t:"Berdan Nº02",d:"2025-11-07"},
 {id:"xmjx8gfOO5M",t:"Spooky Cartoons",d:"2025-10-30"},
 {id:"pCnuXTHBfGM",t:"Mesa Reservada",d:"2025-05-09"},
 {id:"xgTiVnYMqH0",t:"Televice",d:"2023-09-15"}
].sort((a,b)=>b.d.localeCompare(a.d));

/* Miniatura en la mayor resolución disponible (1280×720); si el vídeo no la tiene, se prueba con las siguientes. */
const thumb=(id,f)=>"https://i.ytimg.com/vi/"+id+"/"+f+".jpg";
export const videoThumb=id=>thumb(id,"maxresdefault");
export const videoThumbFallbacks=id=>[thumb(id,"sddefault"),thumb(id,"hqdefault")];
export const videoEmbedUrl=id=>"https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0";
export const videoWatchUrl=id=>"https://www.youtube.com/watch?v="+id;
