# Pruebas

La web no tiene pruebas automáticas en el repositorio (no hay herramientas ni dependencias que instalar). Este documento recoge cómo comprobarla a mano, qué se ha probado y cómo repetir la batería de tamaños de pantalla con un navegador automatizado.

## Probar en local

```sh
python3 -m http.server 8000      # o: npx serve .
```

Abre <http://localhost:8000> y usa el **modo de dispositivo** de las herramientas de desarrollo del navegador (Chrome: F12 → icono de móvil) para simular distintos tamaños, en vertical y en horizontal.

## Lista de comprobación manual

**Portada**
- [ ] Último lanzamiento con título, "Artistas · Tipo · Año", preescucha de Spotify y botones de plataformas.
- [ ] Los botones abren la plataforma (en el móvil, la app si está instalada).

**Carruseles** (Lanzamientos, Videoclips, Merch)
- [ ] Clic en una tarjeta lateral → el carrusel va hasta ella.
- [ ] Clic en la tarjeta activa → se abre el pop up.
- [ ] Arrastre con ratón y con el dedo, con inercia al soltar.
- [ ] Con el escenario enfocado (tabulador), ← y → mueven el carrusel.
- [ ] El color de la sección cambia con la tarjeta activa.
- [ ] Sin tocar nada, el carrusel avanza solo y se para al pasar el ratón por encima.
- [ ] "Ver lista" muestra todos los elementos; "Ver carrusel" vuelve.
- [ ] En la lista de videoclips, el vídeo se reproduce en la fila y se para al volver al carrusel.

**Pop ups**
- [ ] Se cierran con la ×, con Escape y con un clic fuera.
- [ ] Las flechas ‹ › y las teclas ← → pasan al anterior y al siguiente (en bucle).
- [ ] Al cerrar, la música o el vídeo dejan de sonar.
- [ ] En merch, las miniaturas cambian la foto principal y el botón de compra se ve sin hacer scroll (en un portátil).

**General**
- [ ] El botón ES/EN cambia el idioma, y la elección se recuerda al volver.
- [ ] Con el sistema en modo oscuro, la web se ve bien.
- [ ] El formulario de contacto avisa al enviar (con un mensaje de prueba).
- [ ] La cabecera es transparente arriba del todo y aparece con fondo al bajar.
- [ ] La consola del navegador no muestra errores.

## Tamaños de pantalla comprobados

El 1 de octubre de 2026 se probó la web con Chromium automatizado en estos tamaños, en español e inglés, y algunos también en modo oscuro:

| Tipo | Tamaños (ancho × alto, px) |
|------|----------------------------|
| Móviles en vertical | 280×653 (plegable), 320×568, 360×640, 375×667, 390×844, 393×873, 412×915, 430×932 |
| Móviles en horizontal | 568×320, 667×320, 667×375, 844×340, 844×390, 932×430 |
| Tablets | 600×960, 768×1024, 820×1180, 821×1180, 834×1194, 1024×768, 1024×1366, 1180×820 |
| Portátiles (alto real de la ventana) | 1024×700, 1280×600, 1280×720, 1366×650, 1366×768, 1440×780, 1440×900, 1536×730, 1536×864 |
| Monitores | 1920×950, 1920×1080, 2560×1440, 3440×1440 |

**Diseño** (27 tamaños de móvil, tablet, portátil y monitor, en español e inglés; 7 de ellos también en modo oscuro). Se comprobó automáticamente:

- que la página no tiene scroll horizontal ni elementos que se salgan de la pantalla (los carruseles se excluyen: sus tarjetas laterales se salen a propósito);
- que ningún texto se sale de su caja ni se parte una palabra entre líneas;
- que la cabecera no tapa la portada y que su logotipo y su menú no se tocan;
- que la tarjeta activa de cada carrusel está entera dentro de la pantalla y que el anillo cubre todo el ancho;
- lo mismo en la vista de lista de las tres secciones;
- que no hay errores de JavaScript, también al cambiar el tamaño de la ventana en vivo.

**Pop ups** (17 tamaños, entre ellos los móviles en horizontal y los portátiles con el alto real de la ventana): que los tres pop ups caben en la pantalla, con el botón de cerrar y las flechas visibles; que el reproductor de vídeo se ve entero; y que en portátil el de producto cabe sin scroll.

Además se revisaron capturas de cada sección a ojo. Es normal que en móviles pequeños o en horizontal los pop ups de disco y de producto necesiten desplazarse por dentro, porque su contenido es más alto que la pantalla.

### Repetir la batería

Con [Playwright](https://playwright.dev) (`npm install playwright`) se puede automatizar. Este ejemplo, con la web servida en el puerto 8000, comprueba el desbordamiento horizontal en varios tamaños. En modo móvil hay que comparar con el ancho del dispositivo: si algo se sale, el navegador ensancha la página y `innerWidth` crece.

```js
// comprobar-tamanos.js — node comprobar-tamanos.js
const {chromium}=require("playwright");
const TAMANOS=[[320,568],[393,873],[667,375],[768,1024],[1366,650],[1920,1080]];
(async()=>{
 const navegador=await chromium.launch();
 for(const [w,h] of TAMANOS){
  const movil=w<=1024;
  const pagina=await navegador.newPage({viewport:{width:w,height:h},isMobile:movil,hasTouch:movil,reducedMotion:"reduce"});
  const errores=[];pagina.on("pageerror",e=>errores.push(e.message));
  await pagina.goto("http://localhost:8000/",{waitUntil:"networkidle"});
  const sobra=await pagina.evaluate(w=>Math.max(document.documentElement.scrollWidth,innerWidth)-w,w);
  console.log(`${w}×${h}: ${sobra>0?"✗ "+sobra+" px de scroll horizontal":"✓ sin desbordes"}${errores.length?" | errores: "+errores:""}`);
  await pagina.screenshot({path:`captura-${w}x${h}.png`,fullPage:true});
  await pagina.close();
 }
 await navegador.close();
})();
```

## Compatibilidad

Navegadores actuales, de 2022 en adelante: **Chrome y Edge 108+, Safari 15.4+ (iOS y macOS) y Firefox 101+**. Las funciones más recientes que usa la web:

| Función | Para qué | Sin soporte |
|---------|----------|-------------|
| Módulos ES (`<script type="module">`) | Todo el JavaScript | La página queda sin carruseles ni pop ups |
| `<dialog>` y `showModal()` | Pop ups | No se abren los pop ups |
| Unidades `dvh` | Alto de los pop ups y de la foto de merch | Hay una alternativa para el ancho del pop up de vídeo; en el resto, la regla no se aplica |
| `@property` | Transición de color de las secciones | El color cambia sin transición (Safari < 16.4, Firefox < 128) |
| `overflow-x: clip` | Evitar scroll horizontal | Puede aparecer un poco de scroll lateral (Safari < 16) |
| `aspect-ratio`, `inset`, `min()/max()/clamp()`, `:focus-visible` | Maquetación y foco | Ampliamente soportadas en esas versiones |

Las pruebas automáticas se hicieron con Chromium (el motor de Chrome, Edge y Android). Conviene repasar de vez en cuando en Safari (iPhone) y Firefox.

## Accesibilidad

- Navegar toda la página sólo con el teclado: tabulador, ← → en los carruseles y en los pop ups, Escape para cerrar.
- Con un lector de pantalla (VoiceOver, TalkBack o NVDA): los carruseles se anuncian como "carrusel" y cada tarjeta como "diapositiva, 2 de 6".
- Con "reducir movimiento" activado en el sistema, nada se mueve solo.
