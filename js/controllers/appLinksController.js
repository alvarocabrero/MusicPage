/* Controlador: en escritorio, los enlaces de escucha intentan abrir la app instalada y, si no abre, la web.
   En móvil no hace falta: el enlace ya lleva a la app (intent:// en Android, enlace universal en iOS). */
import {esMovil,desktopAppUrl,sinApp,recordarApp} from "../models/appLinks.js";

/** Milisegundos que se espera a que la app se abra antes de dar el intento por fallido y abrir la web. */
const ESPERA=1500;

/* Firefox muestra una página de error si la ventana navega a un esquema desconocido; con un iframe oculto no. */
/**
 * Lanza un enlace de app (spotify:, tidal://, music:…) sin salir de la página.
 * @param {string} url Enlace de la app.
 */
function lanzar(url){
 if(!/Firefox\//.test(navigator.userAgent)){location.href=url;return}
 const f=document.createElement("iframe");
 f.style.display="none";f.src=url;document.body.appendChild(f);
 setTimeout(()=>f.remove(),ESPERA+500);
}

/**
 * Abre la web de la plataforma en una pestaña nueva (sin acceso de vuelta a esta página, por seguridad);
 * si el navegador bloquea la ventana emergente, se abre en la misma pestaña.
 * @param {string} url URL web.
 */
function abrirWeb(url){
 const w=window.open(url,"_blank");
 if(w)w.opener=null;else location.href=url;
}

/* Si la app se abre, la página pierde el foco (o el navegador pregunta si abrirla); si no pasa nada, se abre la web. */
/**
 * @param {string} id Plataforma.
 * @param {string} app Enlace de la app de escritorio.
 * @param {string} web URL web, por si la app no se abre.
 */
function abrirApp(id,app,web){
 let abrio=false;
 const fuera=()=>{abrio=true};
 window.addEventListener("blur",fuera);
 document.addEventListener("visibilitychange",fuera);
 lanzar(app);
 setTimeout(()=>{
  window.removeEventListener("blur",fuera);
  document.removeEventListener("visibilitychange",fuera);
  recordarApp(id,abrio);
  if(!abrio)abrirWeb(web);
 },ESPERA);
}

/**
 * En escritorio, intercepta los clics en los botones de plataformas (enlaces con data-p y data-web, ver releaseView)
 * para probar primero la app. Si la plataforma no tiene app de escritorio, o falló hace menos de una semana,
 * se deja que el enlace abra la web normalmente.
 */
export function initAppLinks(){
 if(esMovil)return;
 document.addEventListener("click",e=>{
  const a=e.target.closest("a[data-p]");
  /* Clic central o con teclas modificadoras: se respeta lo que pide el usuario (la web). */
  if(!a||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const id=a.dataset.p,web=a.dataset.web,app=desktopAppUrl(id,web);
  if(!app||sinApp(id))return;
  e.preventDefault();
  abrirApp(id,app,web);
 });
}
