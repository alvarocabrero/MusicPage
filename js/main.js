/* Punto de entrada: arranca los controladores de cada parte de la página. */
import {initLanguage} from "./controllers/languageController.js";
import {initHeader} from "./controllers/headerController.js";
import {initReleases} from "./controllers/releasesController.js";
import {initVideos} from "./controllers/videosController.js";
import {initMerch} from "./controllers/merchController.js";
import {initContact} from "./controllers/contactController.js";
import {initAppLinks} from "./controllers/appLinksController.js";

initLanguage();
initHeader();
initReleases();
initVideos();
initMerch();
initContact();
initAppLinks();
