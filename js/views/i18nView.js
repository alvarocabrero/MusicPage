/* Vista: aplica el idioma a los textos estáticos del HTML y muestra el botón de cambio de idioma.
   El HTML de index.html lleva los textos en español como contenido inicial (lo que ven buscadores y quien navega
   sin JavaScript); al arrancar, apply() los cambia por los del idioma activo. */
import {getLang,otherLang,t} from "../models/i18n.js";

export const i18nView={
 /* [data-i18n]="clave" cambia el texto; [data-i18n-attr]="atributo:clave;otro:clave" cambia atributos. */
 /**
  * Traduce la página: atributo lang de <html>, título de la pestaña, textos marcados con data-i18n y atributos
  * marcados con data-i18n-attr (por ejemplo aria-label, title, content o value).
  */
 apply(){
  document.documentElement.lang=getLang();
  document.title=t("title");
  document.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=t(e.dataset.i18n)});
  document.querySelectorAll("[data-i18n-attr]").forEach(e=>{
   e.dataset.i18nAttr.split(";").forEach(p=>{const [a,k]=p.split(":");e.setAttribute(a,t(k))});
  });
 },
 /** Botón ES/EN de la cabecera (#lang); su texto es el idioma al que se cambia. @returns {HTMLButtonElement} */
 get button(){return document.getElementById("lang")},
 /** @returns {string} El idioma al que lleva el botón. */
 other(){return otherLang()}
};
