# Página de administración

**artekills.com/admin** sirve para editar los **lanzamientos**, los **videoclips** y el **merch** desde el móvil o el ordenador, sin tocar código. Al pulsar «Publicar», los cambios se suben a GitHub y la web se actualiza sola en 1-2 minutos.

La página no está enlazada desde la web y los buscadores no la indexan. Aun así, sin una clave de GitHub con permiso sobre el repositorio no se puede cambiar nada: quien la abra sin clave sólo ve la pantalla de entrada.

## Entrar: la clave de GitHub

La primera vez pide una **clave de GitHub** (token). Se guarda sólo en ese navegador (con «Recordar en este dispositivo») y se puede quitar con «Salir».

Cómo crearla, con la cuenta **dueña del repositorio** (`alvarocabrero`):

1. GitHub → foto de perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token** ([enlace directo](https://github.com/settings/personal-access-tokens/new)).
2. Nombre: «Admin web». Caducidad: la que quieras; cuando caduque, la página dirá que la clave no es válida y habrá que crear otra.
3. **Repository access** → «Only select repositories» → `alvarocabrero/MusicPage`.
4. **Permissions** → Repository permissions → **Contents: Read and write** (GitHub añade solo «Metadata: Read-only»).
5. **Generate token**, copiarla y pegarla en la página.

Si la cuenta que va a editar es **colaboradora** del repositorio pero no la dueña, GitHub no deja crear una clave fine-grained para un repositorio ajeno. En ese caso: [clave clásica](https://github.com/settings/tokens/new?scopes=public_repo&description=Admin%20web) con el permiso **`public_repo`**. Sirve para cualquier repositorio público al que esa cuenta pueda escribir, así que conviene darle caducidad.

**Si se pierde el móvil o se sospecha que alguien tiene la clave**: bórrala en GitHub (Settings → Developer settings → tokens) y crea otra. Todo lo publicado queda en el historial del repositorio y se puede deshacer.

## Usarla

- **Pestañas** Lanzamientos / Videoclips / Merch. Cada elemento tiene **Editar**, **✕** (borrar) y, en lanzamientos y merch, **↑ ↓** para cambiar el orden. **+ Añadir** crea uno nuevo.
- **Nada se publica hasta pulsar «Publicar».** Mientras tanto, la barra de abajo dice cuántos cambios hay, y los elementos cambiados se marcan en rojo. **Descartar** vuelve a lo publicado.
- **Vista previa** abre la web entera con los cambios, fotos nuevas incluidas, antes de publicarlos.
- **Publicar** enseña un resumen y lo sube todo junto en un solo commit de `main` («Admin: …»).

### Lanzamientos

- El **primero** de la lista es el «Último lanzamiento» de la portada; los nuevos se añaden arriba. Al publicar, la página actualiza también la portada que viene escrita en `index.html` (lo mismo que hace `node tools/portada.mjs`).
- **Portada**: cualquier foto (JPG, PNG, WebP…). Se recorta al cuadrado central y se guarda en WebP a 1200 × 1200. Si es más pequeña no se amplía, y avisa.
- **Artistas**: separados por comas, en orden de crédito («Arte Kills, Silver J» → «Arte Kills & Silver J» en la web).
- **Spotify**: el enlace del álbum (activa la preescucha y el botón de Spotify).
- **Enlaces**: los de cada plataforma; los vacíos no se muestran.

### Videoclips

- Basta con el **enlace de YouTube**, el **título** y la **fecha**. La web los ordena sola por fecha y la miniatura sale de YouTube.

### Merch

- **Fotos**: se pueden añadir varias a la vez, ordenar con ← → y quitar con ✕. La primera es la principal (tarjeta del carrusel). Se guardan en WebP con 900 px en el lado corto, sin recortar (la web las encuadra al mostrarlas).
- Nombre, precio y descripción en **español e inglés**. Si el inglés se deja vacío, se muestra el español.
- **Enlace de compra** y **texto del botón** («Comprar» o «Pedir por Instagram»). Sin enlace, el producto no tiene botón.
- El texto de envíos común a todos los productos (`MERCH_ENVIO`) no se edita aquí: está en `js/models/merch.js`.

## Qué hace por dentro

| Paso | Detalle |
|------|---------|
| Leer | Con la API de GitHub lee de `main` los datos (`js/data/releases.js`, `videos.js`, `merch.js`) e `index.html`. |
| Editar | Trabaja sobre una copia en el navegador. Los textos se validan: no pueden llevar `<`, `>` ni comillas dobles, porque la web los inserta en el HTML (se usan « » o “ ”). Los enlaces deben empezar por `https://`. |
| Fotos | Se reducen y se convierten a WebP en el propio navegador (`admin/images.js`). Safari no sabe guardar WebP, así que ahí se usa el codificador de `admin/vendor/webp` (libwebp en WebAssembly, que sólo se descarga en ese caso). |
| Vista previa | Carga la `index.html` de la web en un marco y, con un *import map*, sustituye los archivos de `js/data/` por los editados. Las fotos aún no publicadas se cambian por las locales. |
| Publicar | Un solo commit con la API de Git Data: archivos de datos, fotos nuevas, borrado de las fotos que ya no usa nadie, la portada de `index.html` y la fecha `<lastmod>` de `sitemap.xml`. Si alguien ha publicado mientras tanto en **otros** archivos, se publica encima sin problema; si ha cambiado los **mismos** datos, avisa y no publica nada. |

Archivos: `admin/index.html` (página), `admin/admin.js` (lógica), `admin/github.js` (API de GitHub), `admin/images.js` (fotos), `admin/admin.css`.

## Editar a mano

Los archivos de `js/data/` también se pueden editar directamente (ver [contenido.md](contenido.md)). Son **JSON** después de `export default`: comillas dobles en claves y textos, sin comas finales ni comentarios dentro. Si se cambia el primer disco a mano, hay que ejecutar `node tools/portada.mjs`.
