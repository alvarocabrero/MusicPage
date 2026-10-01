/* Vista: formulario de contacto.
   Lee los campos del formulario #cf y muestra el estado del envío en #cf-msg (una zona aria-live, que los
   lectores de pantalla anuncian). La lógica del envío está en contactController y contact.js. */
import {CONTACT_EMAIL} from "../models/contact.js";
import {t} from "../models/i18n.js";

/** @returns {HTMLFormElement} El formulario de contacto. */
const form=()=>document.getElementById("cf");
/** @returns {HTMLElement} La línea de estado bajo el botón de enviar. */
const msg=()=>document.getElementById("cf-msg");

export const contactView={
 /** El formulario (para escuchar su evento submit). @returns {HTMLFormElement} */
 get form(){return form()},
 /** @returns {Object<string,string>} Todos los campos del formulario, ocultos incluidos, como {nombre: valor}. */
 data(){const d={};new FormData(form()).forEach((v,k)=>{d[k]=v});return d},
 /** Estado "Enviando…": desactiva el botón para no enviar dos veces. */
 sending(){form().querySelector("button").disabled=true;msg().textContent=t("contact.sending")},
 /** Mensaje enviado: avisa y vacía el formulario. */
 sent(){msg().textContent=t("contact.sent");form().reset()},
 /** Error al enviar: avisa y ofrece el correo directo como alternativa. */
 failed(){msg().innerHTML=t("contact.failed")+' <a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>.'},
 /** Vuelve a activar el botón (tanto si el envío salió bien como si no). */
 idle(){form().querySelector("button").disabled=false}
};
