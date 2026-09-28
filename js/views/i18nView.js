/* Vista: aplica el idioma a los textos estáticos del HTML y muestra el botón de cambio de idioma. */
import {getLang,otherLang,t} from "../models/i18n.js";

export const i18nView={
 /* [data-i18n]="clave" cambia el texto; [data-i18n-attr]="atributo:clave;otro:clave" cambia atributos. */
 apply(){
  document.documentElement.lang=getLang();
  document.title=t("title");
  document.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=t(e.dataset.i18n)});
  document.querySelectorAll("[data-i18n-attr]").forEach(e=>{
   e.dataset.i18nAttr.split(";").forEach(p=>{const [a,k]=p.split(":");e.setAttribute(a,t(k))});
  });
 },
 get button(){return document.getElementById("lang")},
 other(){return otherLang()}
};
