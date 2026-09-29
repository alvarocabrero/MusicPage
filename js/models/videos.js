/* Modelo: videoclips del canal de YouTube. */
export const VIDEOS=[
 {id:"NYuIrof_Kdk",t:"Grand Chelem (visualizer)"},
 {id:"sLtKuVB39J0",t:"Expediciones en La Taiga"},
 {id:"jdn0HGqiUPY",t:"Berdan Nº02"},
 {id:"xmjx8gfOO5M",t:"Spooky Cartoons"},
 {id:"pCnuXTHBfGM",t:"Mesa Reservada"}
];

/* Miniatura en la mayor resolución disponible (1280×720); si el vídeo no la tiene, se prueba con las siguientes. */
const thumb=(id,f)=>"https://i.ytimg.com/vi/"+id+"/"+f+".jpg";
export const videoThumb=id=>thumb(id,"maxresdefault");
export const videoThumbFallbacks=id=>[thumb(id,"sddefault"),thumb(id,"hqdefault")];
export const videoEmbedUrl=id=>"https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0";
export const videoWatchUrl=id=>"https://www.youtube.com/watch?v="+id;
