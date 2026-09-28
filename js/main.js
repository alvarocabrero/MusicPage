/* Punto de entrada: arranca los controladores de cada parte de la página. */
import {initHeader} from "./controllers/headerController.js";
import {initReleases} from "./controllers/releasesController.js";
import {initVideos} from "./controllers/videosController.js";
import {initMerch} from "./controllers/merchController.js";
import {initContact} from "./controllers/contactController.js";

initHeader();
initReleases();
initVideos();
initMerch();
initContact();
