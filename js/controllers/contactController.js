/* Controlador: envío del formulario de contacto. */
import {sendMessage} from "../models/contact.js";
import {contactView} from "../views/contactView.js";

export function initContact(){
 contactView.form.addEventListener("submit",e=>{
  e.preventDefault();contactView.sending();
  sendMessage(contactView.data())
   .then(()=>contactView.sent())
   .catch(()=>contactView.failed())
   .then(()=>contactView.idle());
 });
}
