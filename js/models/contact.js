/* Modelo: envío del formulario de contacto (servicio FormSubmit).
   FormSubmit reenvía por correo lo que se le manda, sin servidor propio. Se usa su API AJAX para no salir de la página;
   el formulario del HTML apunta también a FormSubmit, así que sin JavaScript se envía igual (con recarga). */

/** Correo que recibe los mensajes (también se muestra si el envío falla). */
export const CONTACT_EMAIL="kbrekills@gmail.com";
/** Dirección de la API de FormSubmit para ese correo. */
const ENDPOINT="https://formsubmit.co/ajax/"+CONTACT_EMAIL;

/* Envía el mensaje; devuelve una promesa que se resuelve si el servicio lo acepta. */
/**
 * @param {Object<string,string>} data Campos del formulario: name, email, message y los ocultos de FormSubmit
 *   (_subject, _captcha, _template, _honey).
 * @returns {Promise<void>} Se resuelve si FormSubmit acepta el mensaje; se rechaza si responde que no o falla la red.
 */
export function sendMessage(data){
 return fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)})
  .then(r=>r.json())
  .then(j=>{if(!(j.success==="true"||j.success===true))throw new Error("rechazado")});
}
