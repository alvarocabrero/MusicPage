/* Escribe en index.html el bloque de la portada (último lanzamiento) a partir de js/models/releases.js, con el mismo
   código que lo pinta en el navegador (heroView.render). Así la portada sale completa en cuanto llega el HTML, sin
   esperar a JavaScript; al arrancar, JavaScript la vuelve a pintar igual (en el idioma de cada visitante y con los
   enlaces de su dispositivo) y pone el reproductor de Spotify.
   Uso, desde la carpeta del repositorio, cada vez que cambie el primer disco de releases.js:
     node tools/portada.mjs
   (Si se olvida, la web sigue funcionando: JavaScript corrige la portada al cargar, aunque se note el cambio.) */
import {readFileSync,writeFileSync} from "node:fs";

/* El código de la vista sólo necesita document.getElementById (y navigator, que Node trae desde la versión 21):
   se le dan sustitutos; el de document guarda el HTML que pinta la vista. */
if(!globalThis.navigator)globalThis.navigator={userAgent:"",maxTouchPoints:0};
const els={};
globalThis.document={getElementById:id=>els[id]||(els[id]={innerHTML:"",textContent:""})};
const {heroView}=await import("../js/views/releaseView.js");
const {latestRelease}=await import("../js/models/releases.js");
heroView.render(latestRelease());

const file=new URL("../index.html",import.meta.url);
const html=readFileSync(file,"utf8");
const re=/(<!-- portada -->)[\s\S]*?(<!-- \/portada -->)/;
if(!re.test(html))throw new Error("index.html no tiene las marcas <!-- portada --> … <!-- /portada -->");
const out=html.replace(re,(m,a,b)=>a+els.hrel.innerHTML+b);
if(out===html)console.log("La portada de index.html ya estaba al día.");
else{writeFileSync(file,out);console.log("Portada actualizada en index.html: "+latestRelease().t)}
