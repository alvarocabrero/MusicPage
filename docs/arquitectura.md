# Arquitectura

La web es una única página (`index.html`) con JavaScript en módulos ES y CSS por zonas. No hay dependencias ni herramientas de compilación: el navegador carga los archivos tal cual están en el repositorio.

## Visión general

```
index.html  ── estructura fija: cabecera, portada, 3 secciones, 3 pop ups, pie
   │           (textos en español, marcados con data-i18n para traducirlos; la portada
   │            trae ya escrito el último lanzamiento, generado por tools/portada.mjs)
   │
   └─ js/main.js  ── arranca, en orden, los controladores:
         languageController  → idioma y textos del HTML (tiene que ir primero)
         headerController    → cabecera transparente arriba del todo
         releasesController  → portada + carrusel de lanzamientos + pop up de disco
         videosController    → carrusel de videoclips + pop up de vídeo
         merchController     → carrusel de merch + pop up de producto
         contactController   → formulario de contacto
         appLinksController  → abrir las plataformas en la app de escritorio
```

El código sigue el patrón **modelo-vista-controlador**:

- **Modelos** (`js/models/`): los datos (discos, vídeos, productos, textos) y la lógica que no toca la página (estado del carrusel, el muelle de las animaciones, cómo construir los enlaces a las apps…). No crean ni modifican HTML.
- **Vistas** (`js/views/`): convierten los datos en HTML y actualizan la página. No guardan estado ni escuchan eventos.
- **Controladores** (`js/controllers/`): escuchan lo que hace la persona (clics, arrastres, teclas, scroll, envíos) y coordinan modelos y vistas.

**La portada no espera a JavaScript.** El bloque del último lanzamiento viene escrito en `index.html`, entre las marcas `<!-- portada -->`: lo genera `tools/portada.mjs` con la misma función que lo pinta en el navegador (`heroView.render`), así que se ve en el primer pintado y la página no salta al arrancar. Al arrancar, JavaScript lo vuelve a pintar igual, en el idioma de la visita y con los enlaces de su dispositivo (en Android, los que abren la app), y pone el reproductor de Spotify en su hueco, que ya tiene el alto reservado. Si el primer disco de `releases.js` cambia y no se ejecuta el script, la web sigue funcionando: JavaScript corrige la portada al arrancar, aunque se vea un instante la antigua.

## Archivos

### Modelos

| Archivo | Responsabilidad |
|---------|-----------------|
| `releases.js` | Lista de discos (`RELEASES`), del más reciente al más antiguo; `latestRelease()` devuelve el de la portada. Campos en [contenido.md](contenido.md#discos). |
| `videos.js` | Lista de videoclips (`VIDEOS`), que se ordena sola por fecha; URLs de miniatura, reproductor incrustado y página de YouTube. |
| `merch.js` | Lista de productos (`MERCH`) y el texto común de envíos (`MERCH_ENVIO`). |
| `i18n.js` | Idioma activo y diccionario de textos en español e inglés. `t(clave, variables)` da un texto de la interfaz; `tr(dato)` resuelve un dato que viene como `{es, en}`. Detecta el idioma y lo recuerda en `localStorage` (clave `lang`). |
| `platforms.js` | Plataformas de escucha, en el orden de los botones (`PLATS`), y `linksFor(disco)`, que da sólo las que tienen enlace para ese disco. |
| `appLinks.js` | Detecta el sistema (`SO`: android, ios, mac, pc) y prepara los enlaces para abrir la app: `intent://` en Android, enlace web en iOS (enlace universal) y esquemas propios en escritorio. Recuerda una semana las plataformas que no abrieron app (`localStorage`, clave `appLinks`). |
| `contact.js` | Envío del formulario a la API de FormSubmit (`sendMessage`). |
| `theme.js` | Colores de fondo y texto de las secciones según la tarjeta activa (`stageColors`). |
| `carouselModel.js` | Estado de un carrusel: número de tarjetas del anillo, posición continua, tarjeta activa y modo lista. |
| `spring.js` | Muelle críticamente amortiguado que mueve los carruseles con suavidad (solución exacta, independiente de los fotogramas por segundo). |
| `cursor.js` | Posición dentro de una lista circular; la usan los pop ups para el anterior/siguiente. |

### Vistas

| Archivo | Responsabilidad |
|---------|-----------------|
| `carouselView.js` | Crea las tarjetas del anillo y la vista de lista, y en cada fotograma coloca cada tarjeta según la posición del carrusel. También pinta los colores de la sección, gestiona la accesibilidad de la tarjeta activa y el cursor circular. Ver [carrusel.md](carrusel.md). |
| `releaseView.js` | HTML de las tarjetas, filas y portada de un disco, y el pop up de preescucha (`heroView`, `releaseDialogView`). Formatea los artistas ("A & B") con espacios que no parten nombres ni fechas. |
| `videoView.js` | HTML de las tarjetas y filas de vídeo, miniaturas con respaldo, reproductor en la fila (`playInline`) y pop up de vídeo. |
| `merchView.js` | HTML de las tarjetas y filas de producto y el pop up con galería de fotos. |
| `i18nView.js` | Aplica el idioma a los textos fijos del HTML (`data-i18n` y `data-i18n-attr`). |
| `headerView.js` | Cambia la cabecera entre transparente (arriba del todo) y con fondo. |
| `contactView.js` | Lee el formulario y muestra su estado (enviando, enviado, error). |
| `icons.js` | Iconos SVG en línea y logotipos de las plataformas. |

Las tres vistas de pop up (`releaseDialogView`, `videoDialogView`, `merchDialogView`) tienen **la misma interfaz**: `el`, `prev`, `next`, `close`, `render(elemento)`, `open()`, `hide()`, `isOpen()` y `clear()`. Así un único controlador (`dialogController`) sirve para los tres.

### Controladores

| Archivo | Responsabilidad |
|---------|-----------------|
| `languageController.js` | Fija el idioma al arrancar, traduce el HTML y conecta el botón ES/EN (guarda la elección y recarga). |
| `headerController.js` | Pone la cabecera transparente mientras la página está arriba del todo. |
| `carouselController.js` | Todo el comportamiento de un carrusel: clic, arrastre con inercia, teclado, cambio de tamaño, vista de lista y avance automático. Lo reutilizan las tres secciones. |
| `dialogController.js` | Comportamiento común de los pop ups: cerrar, clic fuera, flechas y teclado. Devuelve `abrir(i)`. |
| `releasesController.js` | Portada, carrusel de lanzamientos y pop up de disco. |
| `videosController.js` | Carrusel de videoclips, reproducción en la lista y pop up de vídeo. |
| `merchController.js` | Carrusel de merch, pop up de producto y sus miniaturas. |
| `contactController.js` | Envía el formulario sin recargar la página y muestra el resultado. |
| `appLinksController.js` | En escritorio, intenta abrir la app de la plataforma y, si en 1,5 s no se abre, abre la web. |

## Un clic, de principio a fin

Qué pasa al pulsar "Escuchar" en la tarjeta activa del carrusel de lanzamientos:

1. `carouselController` recibe el clic en el escenario y averigua la tarjeta con `carouselView.cardAt()`.
2. Como es la tarjeta activa, llama a `onOpen(i)` con el índice del disco (`CarouselModel.itemOf`).
3. `onOpen` es la función `abrir` de `dialogController`, que fija la posición en el `Cursor`, pide a la vista que pinte el disco (`releaseDialogView.render`) y abre el `<dialog>`.
4. `releaseView` construye la preescucha de Spotify y los botones de plataformas a partir de `releases.js` (`linksFor`) y de `appLinks.js` (`linkAttrs`, que decide el `href` según el dispositivo).
5. Si se pulsa una plataforma en escritorio, `appLinksController` intercepta el clic y prueba primero la app.
6. Al cerrar el pop up, `dialogController` llama a `clear()` y la preescucha deja de sonar.

Si el clic es en una tarjeta lateral, el paso 2 cambia: el controlador llama a `set()`, que actualiza el modelo y anima el muelle hasta esa tarjeta.

## Convenciones

- **Idioma**: nombres, comentarios y documentación en español (con alguna excepción heredada en inglés, como `RELEASES`, `cardHTML` o `layout`).
- **Estilo compacto**: el código es denso (una o pocas líneas por función, sin espacios superfluos). Al editarlo, conviene mantener ese estilo.
- **Comentarios**: cada archivo empieza con un comentario que explica su papel; las funciones llevan JSDoc (`/** … */`) con parámetros y valor devuelto, que los editores muestran como ayuda.
- **Módulos ES** con rutas relativas y extensión `.js` (`import {t} from "../models/i18n.js"`).
- **HTML generado por concatenación de cadenas**: los textos de los datos se insertan tal cual, así que **no deben llevar `<` ni comillas dobles**.
- **Textos traducibles**: los fijos del HTML con `data-i18n="clave"` y `data-i18n-attr="atributo:clave;…"`; los generados por JavaScript con `t("clave")`; los de los datos como `{es: "…", en: "…"}` resueltos con `tr()`.
- **CSS**: una regla por línea, variables con nombres en español (`--rojo`, `--tinta`, `--fondo`), comentarios por bloque. Ver [estilos.md](estilos.md).

## Servicios externos

| Servicio | Para qué | Si no está disponible |
|----------|----------|-----------------------|
| Google Fonts | Fuentes Raleway y Merriweather | Se usan Helvetica/Arial y Georgia |
| Spotify (`open.spotify.com/embed`) | Preescucha en la portada y en el pop up de disco | El hueco del reproductor queda vacío |
| YouTube (`youtube-nocookie.com`, `i.ytimg.com`) | Reproductor de vídeo y miniaturas | Las tarjetas quedan de color, con el título |
| FormSubmit | Envío del formulario de contacto | Se muestra un aviso con el correo directo |
| Instagram | Compra de merch (enlace del botón) | — |

La web no usa cookies propias. Sólo guarda en `localStorage` el idioma elegido (`lang`) y las plataformas que no abrieron la app de escritorio (`appLinks`).

## Accesibilidad

- Cada carrusel es una región con `aria-roledescription="carrusel"`; cada tarjeta, un grupo "diapositiva" con su posición ("2 de 6"). Sólo la tarjeta activa es visible para lectores de pantalla y alcanzable con el tabulador.
- El escenario se puede enfocar y mover con ← →; los pop ups se navegan con ← → y se cierran con Escape.
- Los pop ups son `<dialog>` modales con `aria-labelledby`; los botones de icono tienen `aria-label` traducido.
- El resultado del formulario se anuncia (zona `aria-live`).
- El contorno de foco sólo aparece al navegar con teclado (`:focus-visible`).
- Con "reducir movimiento" activado no hay avance automático, vaivén de las tarjetas, transiciones de color ni desplazamiento suave.
