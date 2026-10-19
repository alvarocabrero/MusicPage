/* Modelo: merch (productos a la venta).
   Fuente de datos del carrusel "Merch", de su vista de lista y del pop up de producto (galería de fotos).
   k = tipo de producto (clave de traducción), imgs = lista de imágenes (la primera es la principal),
   url = enlace de compra, cta = clave del texto del botón. Los textos van en {es,en}. Los datos están en
   js/data/merch.js (se editan desde /admin; ver docs/admin.md). */
import DATA from "../data/merch.js";

/**
 * Un producto.
 * @typedef {Object} MerchItem
 * @property {"cd"|"vinyl"|"shirt"} k Tipo de producto; es la clave de traducción "kind.<k>" (etiqueta de la tarjeta).
 * @property {{es:string,en:string}} t Nombre del producto.
 * @property {{es:string,en:string}} p Precio, tal cual se muestra (p. ej. "10 € + gastos de envío").
 * @property {{es:string,en:string}} [d] Descripción del pop up.
 * @property {string} [url] Enlace de compra (botón del pop up); sin él no hay botón.
 * @property {string} [cta] Clave de traducción del texto del botón (por defecto "buy", "Comprar").
 * @property {string[]} imgs Rutas de las fotos; la primera es la principal (tarjeta y lista). Con más de una,
 *   el pop up muestra miniaturas para cambiar de foto.
 */

/**
 * Texto común de envíos que aparece en todos los pop ups de producto.
 * @type {{es:string,en:string}}
 */
export const MERCH_ENVIO={es:"Envíos a todo el mundo · Entrega en mano en Madrid y Oviedo",en:"Worldwide shipping · Hand delivery in Madrid and Oviedo"};

/**
 * Productos, en el orden del carrusel y de la lista.
 * @type {MerchItem[]}
 */
export const MERCH=DATA;
