/* Modelo: envío del formulario de contacto (servicio FormSubmit). */
export const CONTACT_EMAIL="kbrekills@gmail.com";
const ENDPOINT="https://formsubmit.co/ajax/"+CONTACT_EMAIL;

/* Envía el mensaje; devuelve una promesa que se resuelve si el servicio lo acepta. */
export function sendMessage(data){
 return fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)})
  .then(r=>r.json())
  .then(j=>{if(!(j.success==="true"||j.success===true))throw new Error("rechazado")});
}
