# Despliegue

## GitHub Pages

La web se publica con **GitHub Pages** desde la raíz de la rama **`main`**, con el dominio propio **artekills.com** (archivo `CNAME`).

1. Se hace `push` a `main` (directamente o fusionando una rama).
2. GitHub lanza el flujo **"pages build and deployment"** (pestaña *Actions* del repositorio): construye el sitio y lo publica. Suele tardar alrededor de un minuto.
3. En cuanto termina en verde, los cambios están en artekills.com. GitHub Pages deja que los navegadores guarden los archivos unos minutos, así que puede hacer falta recargar la página para ver la versión nueva.

Si el flujo falla, el sitio sigue mostrando la última versión publicada correctamente.

No hay nada que compilar: GitHub Pages publica los archivos tal cual. El paso de Jekyll que aparece en el flujo sólo copia los archivos; `_config.yml` le indica que **no publique la documentación** (`README.md` y `docs/`), para que no aparezca como páginas de artekills.com.

### Dominio

- `CNAME` contiene `artekills.com`; **no hay que borrarlo** o GitHub Pages dejará de servir la web en ese dominio.
- El DNS del dominio y la opción "Enforce HTTPS" se gestionan fuera del repositorio (en el proveedor del dominio y en *Settings → Pages* de GitHub).

## Buscadores

| Archivo | Para qué |
|---------|----------|
| `sitemap.xml` | Lista de páginas para los buscadores (sólo la portada). Al publicar contenido nuevo conviene actualizar `<lastmod>` con la fecha del día. |
| `robots.txt` | Permite rastrear todo e indica dónde está el sitemap. |
| `googlee6362dc18ecc5a4a.html` | Verificación de la propiedad del dominio en Google Search Console. **No borrar.** |
| `<link rel="canonical">` (en `index.html`) | Dirección principal de la página: `https://artekills.com/`. |
| `<meta name="description">` | Descripción que muestran los buscadores; se traduce al inglés con el resto de la página. |

El contenido de los carruseles lo genera JavaScript; los buscadores actuales ejecutan JavaScript, pero el HTML ya contiene los títulos de sección y la descripción.

## Iconos y "añadir a la pantalla de inicio"

| Archivo | Uso |
|---------|-----|
| `favicon.ico` (48 px) y `favicon.svg` | Icono de la pestaña |
| `icons/icon-192.png`, `icons/icon-512.png` | Android y manifiesto |
| `icons/maskable-512.png` | Icono adaptable de Android (con margen de seguridad) |
| `apple-touch-icon.png` (180 px) | Icono al añadir la web a la pantalla de inicio en iOS |
| `site.webmanifest` | Nombre, iconos y colores (rojo de la marca) al añadir la web a la pantalla de inicio. Se abre en el navegador (`"display": "browser"`), no como app aparte. |

La barra del navegador en el móvil toma el rojo de la marca (`<meta name="theme-color">`).

## Servicios externos

La web no tiene servidor propio; depende de estos servicios:

| Servicio | Uso | Notas |
|----------|-----|-------|
| Spotify | Reproductor de preescucha (`open.spotify.com/embed/album/<id>`) | Necesita el campo `sp` del disco. |
| YouTube | Reproductor (`youtube-nocookie.com`, que no pone cookies hasta reproducir) y miniaturas (`i.ytimg.com`) | |
| FormSubmit | Reenvía al correo los mensajes del formulario de contacto | En vez del correo se usa el identificador aleatorio que FormSubmit manda al confirmar el correo, para que no se vea en la página: está en `js/models/contact.js` (`FORM_ID`) y en el `action` del formulario de `index.html`. Ver [contenido.md](contenido.md) para cambiar el correo. |
| Instagram | Enlaces de compra de merch y del pie | |
| Plataformas de música | Enlaces de escucha | Ver `js/models/platforms.js`. |

## Antes de publicar

1. Prueba en local ([README](../README.md#verla-en-local)) y repasa la [comprobación rápida](contenido.md#comprobación-rápida).
2. Si has cambiado el diseño, prueba en varios tamaños de pantalla ([pruebas.md](pruebas.md)).
3. Haz `push` a `main` y espera a que el flujo de GitHub Pages termine en verde.
