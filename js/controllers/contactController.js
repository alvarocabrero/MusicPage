/* Controlador: envío del formulario de contacto. */
import {sendMessage} from "../models/contact.js";
import {contactView} from "../views/contactView.js";

/**
 * Envía el formulario sin recargar la página: muestra "Enviando…", manda los datos a FormSubmit y avisa
 * del resultado (si falla, ofrece el correo directo). El navegador ya valida los campos obligatorios y el
 * formato del email antes de que llegue el evento submit.
 */
export function initContact(){
 contactView.form.addEventListener("submit",e=>{
  e.preventDefault();contactView.sending();
  sendMessage(contactView.data())
   .then(()=>contactView.sent())
   .catch(()=>contactView.failed())
   .then(()=>contactView.idle());
 });
}
