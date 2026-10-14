# Guía de contenido

Todo el contenido de la web está en archivos de datos dentro de `js/models/`. Para añadir o cambiar un disco, un vídeo o un producto sólo hay que editar el archivo correspondiente (y, si hace falta, subir las imágenes a `img/`). El HTML no se toca.

Después de cualquier cambio: [comprueba la web en local](../README.md#verla-en-local), en español y en inglés y en un tamaño de móvil, y publica con un `push` a `main` ([despliegue.md](despliegue.md)).

> **Cuidado con la sintaxis.** Los archivos de datos son JavaScript: cada objeto va entre `{ }`, los objetos se separan con comas y los textos van entre comillas dobles. Si falta una coma o sobra una comilla, la página entera deja de funcionar (la consola del navegador dice dónde está el error). Los textos **no deben contener `<` ni comillas dobles `"`** (usa comillas tipográficas « » o “ ”).

## Discos

Archivo: `js/models/releases.js`, lista `RELEASES`.

- El orden es **del más reciente al más antiguo**. **El primero es el "Último lanzamiento"** de la portada; el orden de la lista es también el del carrusel y la vista de lista.
- **Si cambia el primer disco** (uno nuevo, o un dato del que ya estaba), ejecuta `node tools/portada.mjs` desde la carpeta del repositorio (hace falta [Node.js](https://nodejs.org) 18 o posterior). Actualiza la portada que viene escrita en `index.html`, para que se vea al instante. Si no lo haces, la web funciona igual, pero al entrar se verá un momento la portada anterior hasta que JavaScript ponga la nueva.
- Cada disco es un objeto en una sola línea:

```js
{img:"nombre-portada",t:"Título",a:"Arte Kills",k:"album",y:"2026",n:9,sp:"ID_DE_SPOTIFY",links:{yt:"…",tidal:"…",apple:"…",bandcamp:"…",ytm:"…"}},
```

| Campo | Obligatorio | Qué es |
|-------|:-----------:|--------|
| `img` | sí | Nombre de la portada en `img/`, **sin** `.webp`. La web carga `img/<img>.webp` (1200×1200). |
| `t` | sí | Título, escrito normal (las tarjetas lo ponen en mayúsculas). |
| `a` | sí | Artista principal (`"Arte Kills"`) o, si hay varios, una lista en orden de crédito (`["Arte Kills","Silver J"]`). Se muestran como "A & B" o "A, B & C". Los artistas invitados ("feat.") no van aquí. |
| `k` | sí | Tipo: `"album"` o `"ep"`. Para otro tipo (p. ej. sencillo) hay que añadir la clave `kind.<tipo>` en `i18n.js`, en los dos idiomas. |
| `y` | sí | Año de salida, sólo el año: `"2026"`. |
| `n` | sí | Número de canciones (`9` → "9 canciones" / "9 tracks"). Excepcionalmente puede ser un texto libre: `{es:"…",en:"…"}`. Sólo se ve en la vista de lista. |
| `sp` | no | ID del álbum en Spotify: activa la preescucha y el botón de Spotify. Es lo que va tras `/album/` en el enlace del álbum: `https://open.spotify.com/album/`**`6VGBkOI87jrnjTRuvFNyJG`**. |
| `links` | sí | Enlaces directos al disco en cada plataforma. Claves: `bandcamp`, `yt` (YouTube), `apple` (Apple Music), `ytm` (YouTube Music) y `tidal`. Spotify no hace falta (sale de `sp`). Si falta una plataforma, simplemente no se muestra su botón. |

**Portada**: imagen WebP cuadrada de **1200×1200 px** en `img/`, con el nombre en minúsculas y con guiones (`img/nombre-del-disco.webp`). Esa resolución hace falta para que se vea nítida en la tarjeta grande del carrusel, tanto en el ordenador (unos 714 px de ancho) como en los móviles con pantalla de alta densidad. Se saca de la portada original en alta resolución (la que se sube a las tiendas), no ampliando una más pequeña. Para convertir a WebP sirve [Squoosh](https://squoosh.app) (gratis, en el navegador): calidad entre 80 y 90, y comprobar con su comparador que no se nota la diferencia; idealmente, que no pase de 400 KB. Si la imagen no carga, la tarjeta se ve de color con el título.

**Enlaces de Apple Music y Tidal**: usa el enlace web normal del álbum (`https://music.apple.com/es/album/…/123456` y `https://tidal.com/album/123456`); la web lo convierte en el enlace de la app cuando hace falta.

**Al añadir un disco nuevo** conviene también actualizar la fecha `<lastmod>` de `sitemap.xml` (ver [despliegue.md](despliegue.md#buscadores)).

## Videoclips

Archivo: `js/models/videos.js`, lista `VIDEOS`.

```js
{id:"NYuIrof_Kdk",t:"Grand Chelem",d:"2026-04-29"},
```

| Campo | Qué es |
|-------|--------|
| `id` | ID del vídeo en YouTube: lo que va tras `watch?v=` en `https://www.youtube.com/watch?v=`**`NYuIrof_Kdk`**. |
| `t` | Título tal como debe verse (sin añadidos como "(visualizer)" o "(videoclip oficial)"). |
| `d` | Fecha de publicación en YouTube, `AAAA-MM-DD`. Sólo sirve para ordenar. |

- **La lista se ordena sola** del más reciente al más antiguo, así que el vídeo nuevo puede añadirse en cualquier posición.
- La miniatura se toma de YouTube automáticamente (la de 1280×720 si existe; si no, una más pequeña).

## Merch

Archivo: `js/models/merch.js`, lista `MERCH`. El orden de la lista es el del carrusel.

```js
{k:"cd",t:{es:"CD «Taiga & Cazador»",en:"«Taiga & Cazador» CD"},p:{es:"10 € + gastos de envío",en:"€10 + shipping"},d:{es:"…",en:"…"},url:"https://www.instagram.com/p/…/",cta:"cta.instagram",imgs:["img/cd-taiga-cazador-1.webp","img/cd-taiga-cazador-2.webp"]},
```

| Campo | Obligatorio | Qué es |
|-------|:-----------:|--------|
| `k` | sí | Tipo de producto: `"cd"`, `"vinyl"` o `"shirt"` (es la etiqueta de la tarjeta). Para otro tipo, añade `kind.<tipo>` en `i18n.js`. |
| `t` | sí | Nombre del producto, en los dos idiomas. |
| `p` | sí | Precio tal como se muestra, en los dos idiomas. |
| `d` | no | Descripción del pop up, en los dos idiomas. |
| `url` | no | Enlace de compra. Sin él no hay botón de compra. |
| `cta` | no | Texto del botón: `"cta.instagram"` ("Pedir por Instagram") o, si se omite, "Comprar". Se pueden añadir más textos en `i18n.js`. |
| `imgs` | sí | Rutas de las fotos. La primera es la principal (tarjeta y lista); si hay más de una, el pop up muestra miniaturas para cambiar de foto. |

- **Fotos**: WebP cuadrado de **900×900 px**, convertido igual que las portadas (las tarjetas recortan un poco por encima del centro). Una foto vertical también funciona (la de la camiseta es de 720×900).
- El texto de envíos (`MERCH_ENVIO`, al principio del archivo) es común a todos los productos.

## Textos de la interfaz

Archivo: `js/models/i18n.js`, diccionario `DICT`, con un bloque `es` y otro `en`.

- **Cada clave tiene que existir en los dos idiomas.** Si falta en inglés se usa la española; si falta en las dos, en la página aparece la propia clave (por ejemplo `contact.send`), lo que ayuda a detectar el olvido.
- Las claves llevan un prefijo según la zona: `nav.`, `sec.` (títulos de sección), `contact.`, `release.`, `video.`, `merch.`, `kind.` (tipos de disco y producto), `dlg.` (pop ups), `cta.` (botones de compra).
- Un texto puede tener variables entre llaves, que se rellenan al usarlo: `"tracks":"{n} canciones"` → `t("tracks",{n:9})`.

Para usar un texto nuevo:

- **En el HTML fijo** (`index.html`): escribe el texto en español y marca el elemento con `data-i18n="clave"`. Para atributos (como `aria-label`, `title` o `value`) usa `data-i18n-attr="atributo:clave;otro:clave"`.
- **En el HTML generado** (vistas de `js/views/`): usa `t("clave")`.
- **En los datos** (discos, productos): escribe el texto como `{es:"…",en:"…"}`; la vista lo resuelve con `tr()`.

## Enlaces del pie

Los enlaces a Instagram y Bandcamp y el texto de copyright están escritos directamente en el pie de `index.html`. Los mensajes del formulario llegan al correo de la banda a través de FormSubmit. En el código no está el correo, sino el identificador aleatorio que FormSubmit da para él, en `js/models/contact.js` (`FORM_ID`) **y** en el atributo `action` del formulario de `index.html`. Para cambiar el correo: pon el correo nuevo en esos dos sitios, publica, envía un mensaje de prueba desde la web, confirma el correo con el enlace que manda FormSubmit y sustituye el correo por el identificador que llega en el correo de confirmación (en los dos sitios).

## Comprobación rápida

- [ ] La página carga sin errores en la consola del navegador.
- [ ] Si cambió el primer disco, se ha ejecutado `node tools/portada.mjs` (vuelve a ejecutarlo: debe decir que la portada ya estaba al día).
- [ ] El disco, vídeo o producto aparece en el carrusel y en la vista de lista ("Ver lista").
- [ ] El pop up se abre y muestra lo esperado (preescucha, plataformas, fotos…).
- [ ] Se ve bien en español y en inglés (botón ES/EN).
- [ ] Se ve bien en un móvil (o en el modo de dispositivo del navegador, con un ancho de 360–430 px).
