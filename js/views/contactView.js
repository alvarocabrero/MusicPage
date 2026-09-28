/* Vista: formulario de contacto. */
import {CONTACT_EMAIL} from "../models/contact.js";
import {t} from "../models/i18n.js";

const form=()=>document.getElementById("cf");
const msg=()=>document.getElementById("cf-msg");

export const contactView={
 get form(){return form()},
 data(){const d={};new FormData(form()).forEach((v,k)=>{d[k]=v});return d},
 sending(){form().querySelector("button").disabled=true;msg().textContent=t("contact.sending")},
 sent(){msg().textContent=t("contact.sent");form().reset()},
 failed(){msg().innerHTML=t("contact.failed")+' <a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>.'},
 idle(){form().querySelector("button").disabled=false}
};
