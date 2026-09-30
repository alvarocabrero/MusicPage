/* Modelo: plataformas de escucha, en el orden en que se muestran.
   d = enlace directo derivado del disco; s = URL de búsqueda (ya no se usa en la web);
   and = paquete de la app de Android; app(url,so) = enlace que abre la app de escritorio ("" si no hay). */

/* Saca el ID del álbum de la URL web y lo pone tras el prefijo del esquema de la app. */
const idDe=(u,re,pre)=>{const m=u.match(re);return m?pre+m[1]:""};

export const PLATS=[
 {id:"bandcamp",n:"Bandcamp",s:"https://bandcamp.com/search?q=",and:"com.bandcamp.android"},
 {id:"spotify",n:"Spotify",s:"https://open.spotify.com/search/",d:r=>r.sp?"https://open.spotify.com/album/"+r.sp:"",and:"com.spotify.music",app:u=>idDe(u,/\/album\/(\w+)/,"spotify:album:")},
 {id:"yt",n:"YouTube",s:"https://www.youtube.com/results?search_query=",and:"com.google.android.youtube"},
 {id:"apple",n:"Apple Music",s:"https://music.apple.com/es/search?term=",and:"com.apple.android.music",app:(u,so)=>so==="mac"?u.replace(/^https:/,"music:"):""},
 {id:"ytm",n:"YouTube Music",s:"https://music.youtube.com/search?q=",and:"com.google.android.apps.youtube.music"},
 {id:"tidal",n:"Tidal",s:"https://tidal.com/search?q=",and:"com.aspiro.tidal",app:u=>idDe(u,/\/album\/(\d+)/,"tidal://album/")}
];

/* Sólo las plataformas con enlace para ese disco. */
export function linksFor(r){
 return PLATS.map(p=>({p:p,url:(r.links&&r.links[p.id])||(p.d?p.d(r):"")})).filter(x=>x.url);
}

export const platform=id=>PLATS.find(p=>p.id===id);
