/* Modelo: plataformas de escucha, en el orden en que se muestran.
   d = enlace directo derivado del disco; s = URL de búsqueda (ya no se usa en la web). */
export const PLATS=[
 {id:"bandcamp",n:"Bandcamp",s:"https://bandcamp.com/search?q="},
 {id:"spotify",n:"Spotify",s:"https://open.spotify.com/search/",d:r=>r.sp?"https://open.spotify.com/album/"+r.sp:""},
 {id:"yt",n:"YouTube",s:"https://www.youtube.com/results?search_query="},
 {id:"apple",n:"Apple Music",s:"https://music.apple.com/es/search?term="},
 {id:"ytm",n:"YouTube Music",s:"https://music.youtube.com/search?q="},
 {id:"tidal",n:"Tidal",s:"https://tidal.com/search?q="}
];

/* Sólo las plataformas con enlace para ese disco. */
export function linksFor(r){
 return PLATS.map(p=>({p:p,url:(r.links&&r.links[p.id])||(p.d?p.d(r):"")})).filter(x=>x.url);
}
