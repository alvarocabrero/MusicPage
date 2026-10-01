# Arte Kills · web oficial

Web de **Arte Kills** (música, videoclips y merch), publicada en **[artekills.com](https://artekills.com)**.

Es una sola página, en español e inglés, hecha con HTML, CSS y JavaScript puros: **sin dependencias, sin frameworks y sin paso de compilación**. Se publica con GitHub Pages directamente desde la rama `main`.

## Qué incluye

- **Portada con el último lanzamiento**: preescucha de Spotify y botones para escucharlo en Bandcamp, Spotify, YouTube, Apple Music, YouTube Music y Tidal. En el móvil (y en el ordenador, si es posible) los enlaces abren la app instalada.
- **Tres carruseles "tipo escenario"** (Lanzamientos, Videoclips y Merch): tarjetas en anillo que se mueven con clic, arrastre con inercia, teclado y un avance automático lento. Cada uno tiene también una **vista de lista**.
- **Pop ups**: disco (preescucha y plataformas), vídeo (reproductor de YouTube) y producto (galería de fotos y botón de compra), con flechas para pasar al anterior o al siguiente.
- **Formulario de contacto** con [FormSubmit](https://formsubmit.co), que funciona con y sin JavaScript.
- **Español e inglés**: se elige según el idioma del navegador y se puede cambiar con el botón ES/EN, que recuerda la elección.
- **Modo oscuro** automático, según el sistema.
- **Adaptada a cualquier pantalla**: probada de 280 a 3440 px de ancho, en vertical y en horizontal (ver [docs/pruebas.md](docs/pruebas.md)).
- **Accesible**: se puede usar con teclado y lector de pantalla, y respeta la preferencia de "reducir movimiento".

## Verla en local

Como el JavaScript son módulos ES, la página tiene que servirse por HTTP (abrir `index.html` con doble clic no funciona). Desde la carpeta del repositorio:

```sh
python3 -m http.server 8000
# o bien: npx serve .
```

y abre <http://localhost:8000>. No hay nada que instalar ni compilar: cada cambio se ve al recargar.

## Estructura

```
index.html            Única página: cabecera, portada, secciones, pop ups y pie
css/                  Estilos, uno por zona; se cargan en este orden:
  base.css              variables (colores, fuentes), modo oscuro y reglas generales
  header.css            cabecera fija
  hero.css              portada
  sections.css          secciones, portadas de la vista de lista, etiquetas
  merch.css             pop up de producto
  dialogs.css           pop ups, botones de plataformas
  carousel.css          carruseles, vista de lista y pop up de vídeo
  footer.css            pie y formulario de contacto
  ajustes.css           últimos ajustes (se carga la última)
js/
  main.js             Punto de entrada: arranca los controladores
  models/             Datos y lógica sin interfaz
    releases.js         discos            videos.js     videoclips      merch.js   productos
    i18n.js             idiomas y textos  platforms.js  plataformas     appLinks.js abrir en la app
    contact.js          envío del formulario           theme.js      colores de las secciones
    carouselModel.js    estado de un carrusel          spring.js     muelle de las animaciones
    cursor.js           posición en una lista circular (pop ups)
  views/              Generan y actualizan el HTML
  controllers/        Conectan eventos, modelos y vistas
img/                  Portadas, fotos de merch, logotipos y sprite SVG
tools/portada.mjs     Escribe en index.html la portada del último lanzamiento (no se publica)
icons/                Iconos de la web (Android y manifiesto)
docs/                 Documentación (no se publica en la web)
CNAME                 Dominio propio para GitHub Pages
_config.yml           Configuración de GitHub Pages (no publica la documentación ni tools/)
site.webmanifest      Nombre, iconos y colores al añadir la web a la pantalla de inicio
robots.txt, sitemap.xml, googlee6362dc18ecc5a4a.html   Buscadores (no borrar el de Google)
```

La organización del código (modelo-vista-controlador) está explicada en [docs/arquitectura.md](docs/arquitectura.md).

## Actualizar el contenido

Todo el contenido está en tres archivos de datos; no hace falta tocar el HTML:

| Para…                          | Edita                  | Y añade                                   |
|--------------------------------|------------------------|-------------------------------------------|
| Añadir o cambiar un disco      | `js/models/releases.js`| la portada en `img/` (JPG 600×600)        |
| Añadir un videoclip            | `js/models/videos.js`  | nada: la miniatura viene de YouTube       |
| Añadir o cambiar un producto   | `js/models/merch.js`   | las fotos en `img/` (JPG 900×900)         |
| Cambiar un texto de la interfaz| `js/models/i18n.js`    | el texto en español **y** en inglés       |

El primer disco de la lista es el que aparece en la portada como "Último lanzamiento"; si cambia, ejecuta `node tools/portada.mjs` para que la portada de `index.html` se actualice. Paso a paso, con ejemplos: [docs/contenido.md](docs/contenido.md).

## Publicar

Cada `push` a `main` lanza el flujo "pages build and deployment" de GitHub Pages, que tarda alrededor de un minuto; después los cambios ya están en artekills.com (el navegador puede tardar unos minutos más en dejar de usar la versión guardada). Detalles, dominio y buscadores: [docs/despliegue.md](docs/despliegue.md).

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/arquitectura.md](docs/arquitectura.md) | Cómo está organizado el código, qué hace cada archivo, flujo de arranque y convenciones |
| [docs/contenido.md](docs/contenido.md) | Guía para añadir discos, vídeos, productos y textos |
| [docs/carrusel.md](docs/carrusel.md) | Funcionamiento interno de los carruseles (geometría, muelle, gestos, avance automático) |
| [docs/estilos.md](docs/estilos.md) | Hojas de estilo, variables, cortes de diseño y modo oscuro |
| [docs/despliegue.md](docs/despliegue.md) | GitHub Pages, dominio, buscadores, servicios externos |
| [docs/pruebas.md](docs/pruebas.md) | Cómo probar la web, tamaños de pantalla comprobados y compatibilidad |

El código también está comentado: cada archivo empieza explicando su papel y cada función está documentada con JSDoc (en español), así que los editores como VS Code muestran la ayuda al pasar el ratón.

## Compatibilidad

Navegadores actuales (desde 2022): Chrome y Edge 108+, Safari 15.4+ y Firefox 101+. Se usan, entre otros, `<dialog>`, unidades `dvh` y `@property`; donde hace falta hay alternativas para navegadores más antiguos. Más en [docs/pruebas.md](docs/pruebas.md#compatibilidad).

## Licencia

El **código** (HTML, CSS, JavaScript y archivos de configuración) se publica con licencia **MIT**. El **contenido y la marca** (imágenes, portadas, fotos, música, vídeos, textos, y el nombre, logotipo e identidad visual de Arte Kills) **no** están cubiertos por esa licencia: todos los derechos reservados. Los logotipos de las plataformas pertenecen a sus dueños. Texto completo en [LICENSE](LICENSE).
