# Estilos

El CSS está repartido por zonas en `css/`, sin preprocesadores. Cada archivo empieza con un comentario que explica lo que contiene y los bloques importantes llevan su propio comentario.

## Hojas y orden de carga

Se cargan en este orden desde `index.html`. Cuando dos reglas son igual de específicas, **gana la de la hoja que se carga después**:

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | `base.css` | Variables de diseño, modo oscuro, reglas generales (`body`, títulos, foco), columna `.wrap`, logotipos `.lg` |
| 2 | `header.css` | Cabecera fija y su estado transparente (`.at-top`) |
| 3 | `hero.css` | Portada: logotipo y último lanzamiento; rayita `.dash` de los títulos |
| 4 | `sections.css` | Secciones y su título; portadas de la vista de lista (`.cover`); colores `.c0`–`.c3`; etiqueta `.tipo` |
| 5 | `merch.css` | Pop up de producto (foto, miniaturas, textos) |
| 6 | `dialogs.css` | Pop ups (`<dialog>`, caja, cabecera, flechas), botón `.abrir`, botones de plataformas `.plats` |
| 7 | `videos.css` | Restos de la antigua cuadrícula de vídeos (ver [Reglas sin uso](#reglas-sin-uso)) |
| 8 | `carousel.css` | Carruseles, vista de lista, colores animados de las secciones, pop up de vídeo, animación de las tarjetas |
| 9 | `footer.css` | Pie: formulario de contacto, logotipo, redes |
| 10 | `ajustes.css` | Últimos ajustes para móvil y "reducir movimiento" |

## Variables de diseño

Definidas en `:root` (`base.css`):

| Variable | Valor | Uso |
|----------|-------|-----|
| `--rojo` | `#e22c14` | Rojo de la marca: pie, botones, rayita de los títulos, barra del navegador en móvil |
| `--gris` | `#b6bbbf` | Gris de la paleta de identidad |
| `--fondo` | `#fff` (`#000` en oscuro) | Fondo de la página |
| `--tinta` | `#000` (`#fff` en oscuro) | Texto, bordes y contornos |
| `--sobre-rojo` | `#fff` | Texto sobre fondo rojo |
| `--display` | Raleway | Títulos, menú, botones, datos |
| `--texto` | Merriweather | Textos largos (descripciones) |

En las secciones con carrusel, `--fondo` y `--tinta` se sustituyen por `--sbg` y `--sfg`, los colores de la tarjeta activa, que cambian con una transición (ver [carrusel.md](carrusel.md#colores-de-la-sección)). La portada es siempre blanca y el pie siempre rojo, también en modo oscuro.

**Fuentes** (Google Fonts): Raleway 300, 500, 800 y 900; Merriweather 300, 400, 700 y 300 cursiva.

## Cortes de diseño

El corte principal es **820 px**: por debajo se usa el diseño de móvil y por encima el de ordenador. Afecta a la portada (una o dos columnas), al tamaño de las tarjetas del carrusel (calculado en `carouselView.js`, que usa el mismo corte) y a la vista de lista.

| Condición | Archivo | Efecto |
|-----------|---------|--------|
| ancho ≤ ~330 px | `sections.css` | El título de sección se reduce con la pantalla (`min(…, 10.6vw)`) para que "LANZAMIENTOS" quepa |
| ancho ≤ 340 px | `header.css` | Logotipo de la cabecera más pequeño y menú más junto |
| ancho ≤ 380 px | `dialogs.css` | Botones de plataformas en 2 columnas (en vez de 3) |
| ancho ≤ 600 px | `footer.css` | Nombre y email del formulario uno debajo del otro |
| ancho ≤ 700 px | `dialogs.css` | Las flechas de los pop ups pasan debajo de la caja |
| ancho ≤ 820 px | varios | Diseño de móvil |
| ancho ≥ 821 px | `hero.css` | Portada en dos columnas, preescucha grande (352 px) |
| 701–1000 px | `dialogs.css` | En el pop up de vídeo (más ancho), las flechas pasan debajo |
| ancho ≥ 701 px | `merch.css` | La foto del pop up de producto se ajusta también al alto, para que quepa sin scroll |
| alto ≥ 880 px | `dialogs.css` | Preescucha grande (352 px) en el pop up de disco |
| horizontal y alto ≤ 500 px | `dialogs.css` | Pop up de vídeo con las flechas a los lados y el vídeo ajustado al alto |
| alto de la ventana | `carouselView.js` | Las tarjetas no pasan de `alto − 108 px` (móvil en horizontal) |

La columna de contenido (`.wrap`) mide como máximo **1180 px** con 24 px de margen; los carruseles ocupan todo el ancho de la ventana.

## Modo oscuro

Sigue la preferencia del sistema (`prefers-color-scheme: dark`): `--fondo` pasa a negro y `--tinta` a blanco. Está preparado un atributo `data-theme="light"` / `"dark"` en `<html>` para forzar un tema, aunque ahora nada lo pone.

## Movimiento reducido

Con `prefers-reduced-motion: reduce` se quitan el vaivén de las tarjetas, las transiciones de color de las secciones y de la cabecera, y el desplazamiento suave de los enlaces internos. El avance automático de los carruseles también se detiene (en JavaScript).

## Detalles que conviene conocer

- **Cabecera fija de 68 px**: `html { scroll-padding-top }` hace que el enlace "Contacto" no deje el título bajo la cabecera, y la portada tiene relleno superior para lo mismo.
- **Muesca y barra de inicio del móvil**: `env(safe-area-inset-*)` en `:root` y en la cabecera.
- **`body { overflow-x: clip }`**: los carruseles miden `100vw`, que incluye la barra de desplazamiento; sin esto habría unos píxeles de scroll horizontal.
- **Unidades `dvh`** (alto dinámico de la ventana) en los pop ups, para que no queden tapados por las barras del navegador del móvil. El ancho del pop up de vídeo lleva una declaración anterior sin `dvh` como alternativa para navegadores antiguos.
- **`@property --sbg / --sfg`**: sin ella, los colores de las secciones cambiarían de golpe. En navegadores sin soporte cambian igual, pero sin transición.
- **Texto que no se parte**: la etiqueta de las tarjetas (`white-space: nowrap`) y, desde JavaScript, los nombres de artistas, fechas y "9 canciones" (espacios de no separación) no se cortan entre líneas.

## Convenciones

- Una regla por línea; las media queries cortas también en una línea.
- Comentarios en español: uno al principio de cada archivo y otro antes de cada bloque o regla con algo que explicar.
- Colores siempre con las variables cuando dependen del tema; fijos (`#000`, `#fff`) sólo donde el fondo no cambia (portada, pie, etiquetas sobre imagen).

## Reglas sin uso

Algunas reglas vienen de versiones anteriores de la web y ya no las usa ningún elemento. Están marcadas con "Sin uso actualmente" en los comentarios y se pueden borrar sin efecto visible:

| Archivo | Selectores |
|---------|-----------|
| `base.css` | `.l-l`, `.l-d` (y las variables `--logo-l`, `--logo-d`) |
| `hero.css` | `.hero .intro`, `.hero p`, `.btn`, `.btn.alt` |
| `sections.css` | `section .sub`, `.releases`, `.rel …`, `.lnk`, `.vids …` |
| `dialogs.css` | `.rel .cover`, `.dp small` |
| `videos.css` | `.vgrid`, `.vid …` (las reglas de `.vbtn` y `.vcap` están repetidas en `carousel.css`) |
| `carousel.css` | `.track …`, `.ctrl`, `.count`, `.btns …`, la clase `.active` de `.slide` |
| `ajustes.css` | `nav .l`, `.btn.alt` |

Además, el escenario recibe la clase `.dragging` durante el arrastre, pero ninguna regla la usa todavía; está disponible por si se quiere dar estilo al arrastre.
