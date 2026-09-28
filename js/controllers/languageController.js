/* Controlador: elige el idioma (guardado o del navegador) y permite cambiarlo. */
import {detectLang,setLang,rememberLang} from "../models/i18n.js";
import {i18nView} from "../views/i18nView.js";

/* Debe ejecutarse antes que el resto, para que las vistas ya pinten en el idioma correcto. */
export function initLanguage(){
 setLang(detectLang());
 i18nView.apply();
 /* Al cambiar de idioma se guarda la elección y se recarga la página con los textos nuevos. */
 i18nView.button.addEventListener("click",()=>{rememberLang(i18nView.other());location.reload()});
}
