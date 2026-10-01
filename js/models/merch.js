/* Modelo: merch (productos a la venta).
   Fuente de datos del carrusel "Merch", de su vista de lista y del pop up de producto (galería de fotos).
   k = tipo de producto (clave de traducción), imgs = lista de imágenes (la primera es la principal),
   url = enlace de compra, cta = clave del texto del botón. Los textos van en {es,en}. */

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
export const MERCH=[
 {k:"cd",t:{es:"CD «Taiga & Cazador»",en:"«Taiga & Cazador» CD"},p:{es:"10 € + gastos de envío",en:"€10 + shipping"},d:{es:"Arte Kills x Stxners Music · Formato físico.",en:"Arte Kills x Stxners Music · Physical format."},url:"https://www.instagram.com/p/DUEbDSOgMn7/",cta:"cta.instagram",imgs:["img/cd-taiga-cazador-1.webp","img/cd-taiga-cazador-2.webp","img/cd-taiga-cazador-3.webp","img/cd-taiga-cazador-4.webp","img/cd-taiga-cazador-5.webp"]},
 {k:"vinyl",t:{es:"Vinilo «Spooky Cartoons»",en:"«Spooky Cartoons» Vinyl"},p:{es:"25 € + gastos de envío",en:"€25 + shipping"},d:{es:"Lev & Arte Kills · LP 12” negro, 180 g. Edición limitada de 100 unidades.",en:"Lev & Arte Kills · 12” black LP, 180 g. Limited edition of 100 copies."},url:"https://www.instagram.com/p/DU-2Z9Lirou/",cta:"cta.instagram",imgs:["img/vinilo-spooky-cartoons-1.webp","img/vinilo-spooky-cartoons-2.webp"]},
 {k:"shirt",t:{es:"Camiseta «Spooky Cartoons»",en:"«Spooky Cartoons» T-shirt"},p:{es:"15 € + gastos de envío",en:"€15 + shipping"},d:{es:"Tallas S, M, L y XL · 100 % algodón, 180 GSM. Edición limitada de 50 unidades, serigrafiada por delante y por detrás.",en:"Sizes S, M, L and XL · 100% cotton, 180 GSM. Limited edition of 50, screen-printed front and back."},url:"https://www.instagram.com/p/DU-1P_uiobz/",cta:"cta.instagram",imgs:["img/camiseta-spooky-cartoons-1.webp"]}
];
