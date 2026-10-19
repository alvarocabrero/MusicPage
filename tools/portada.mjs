/* Escribe en index.html el bloque de la portada (último lanzamiento) a partir de js/data/releases.js, con el mismo
   código que lo pinta en el navegador (heroHTML de releaseView.js). Así la portada sale completa en cuanto llega el
   HTML, sin esperar a JavaScript; al arrancar, JavaScript la vuelve a pintar igual (en el idioma de cada visitante y
   con los enlaces de su dispositivo) y pone el reproductor de Spotify.
   La página de administración (/admin) ya lo hace sola al publicar. Este script sirve para cuando se edita
   js/data/releases.js a mano; se usa desde la carpeta del repositorio, cada vez que cambie el primer disco:
     node tools/portada.mjs
   (Si se olvida, la web sigue funcionando: JavaScript corrige la portada al cargar, aunque se note el cambio.) */
import {readFileSync,writeFileSync} from "node:fs";

/* El código de las vistas busca sus elementos con document.getElementById al cargarse: se le da un sustituto. */
globalThis.document={getElementById:()=>null};
const {heroHTML}=await import("../js/views/releaseView.js");
const {latestRelease}=await import("../js/models/releases.js");

const file=new URL("../index.html",import.meta.url);
const html=readFileSync(file,"utf8");
const re=/(<!-- portada -->)[\s\S]*?(<!-- \/portada -->)/;
if(!re.test(html))throw new Error("index.html no tiene las marcas <!-- portada --> … <!-- /portada -->");
const out=html.replace(re,(m,a,b)=>a+heroHTML(latestRelease(),"pc")+b);
if(out===html)console.log("La portada de index.html ya estaba al día.");
else{writeFileSync(file,out);console.log("Portada actualizada en index.html: "+latestRelease().t)}
