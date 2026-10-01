/* Punto de entrada: arranca los controladores de cada parte de la página.
   index.html lo carga como módulo (<script type="module">), que se ejecuta cuando el HTML ya está leído, así que
   todos los elementos existen. El orden importa: primero el idioma, para que todo lo que se pinte después salga
   ya traducido; después cada sección. Arquitectura y responsabilidades: ver docs/arquitectura.md. */
import {initLanguage} from "./controllers/languageController.js";
import {initHeader} from "./controllers/headerController.js";
import {initReleases} from "./controllers/releasesController.js";
import {initVideos} from "./controllers/videosController.js";
import {initMerch} from "./controllers/merchController.js";
import {initContact} from "./controllers/contactController.js";
import {initAppLinks} from "./controllers/appLinksController.js";

initLanguage();   /* idioma y textos del HTML (debe ir primero) */
initHeader();     /* cabecera transparente arriba del todo */
initReleases();   /* portada (último lanzamiento), carrusel de lanzamientos y su pop up */
initVideos();     /* carrusel de videoclips y su pop up */
initMerch();      /* carrusel de merch y su pop up */
initContact();    /* formulario de contacto */
initAppLinks();   /* abrir las plataformas en la app de escritorio */
