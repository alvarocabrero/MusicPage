# Los carruseles

Las tres secciones (Lanzamientos, Videoclips y Merch) usan el mismo carrusel "tipo escenario": una tarjeta grande (la activa) y las demás estrechas a su lado, que se deslizan, cambian de tamaño y flotan suavemente. Lo forman tres piezas:

| Pieza | Archivo | Papel |
|-------|---------|-------|
| Modelo | `js/models/carouselModel.js` | Qué tarjeta está activa y en qué posición está el carrusel |
| Muelle | `js/models/spring.js` | Cómo se llega a esa posición (movimiento suave, sin rebotes) |
| Vista | `js/views/carouselView.js` | Dónde se pinta cada tarjeta para una posición dada |
| Controlador | `js/controllers/carouselController.js` | Clics, arrastre, teclado, vista de lista y avance automático |

Cada sección lo monta con su propio contenido desde su controlador (`releasesController`, `videosController`, `merchController`), pasando a `initCarousel` cuántos elementos hay (`n`), cómo se pinta cada tarjeta (`card`) y cada fila de la lista (`row`), y qué hacer al pulsar la tarjeta activa (`onOpen`).

## El anillo

Las tarjetas forman un **anillo**: al pasar la última se vuelve a la primera. Para que la fila de tarjetas llene siempre la pantalla, el anillo tiene `m` tarjetas, que repiten la lista de `n` elementos las veces necesarias:

```
SLOTS = máx(8, ⌈ancho de la pantalla / 280⌉ + 2)     (carouselController)
m     = n · ⌈SLOTS / n⌉                               (CarouselModel)
```

En el móvil y hasta unos 1700 px de ancho `SLOTS` es 8: con 6 discos hay 12 tarjetas y con 3 productos, 9. En monitores muy anchos crece para que no quede un hueco vacío a la derecha (a 3440 px: 18 y 15).

Cada tarjeta sabe su posición en el anillo (`data-j`) y el elemento real que muestra (`data-idx` = `j % n`).

## Posición continua

El estado del carrusel es un número `pos` que **puede tener decimales**: `pos = 2` es "la tarjeta 2 está activa" y `pos = 2,4` es "a medio camino entre la 2 y la 3". La tarjeta activa es la más cercana (`Math.round`). Esto permite que la misma función de dibujo sirva para el reposo, las animaciones y el arrastre.

## Geometría (carouselView)

`metrics()` calcula las medidas para el tamaño actual (`cw` = ancho del carrusel, que ocupa toda la ventana):

| Medida | Móvil (≤ 820 px) | Ordenador (> 820 px) |
|--------|------------------|----------------------|
| `H`, alto de las tarjetas | mín(400, 1,02·cw) | mín(460, 0,36·cw) |
| `W`, ancho de la activa | 0,6·cw | 1,55·H |
| `N`, ancho de las laterales | 0,3·cw | 0,55·H |
| `G`, separación | 12 px | 24 px |
| `x0`, borde izquierdo de la activa | 9 % de cw | 8 % de cw |

Además, `H` nunca pasa de `alto de la ventana − 108 px` (con un mínimo de 180): en un móvil en horizontal la tarjeta cabe entera bajo la cabecera fija. El escenario mide `H + 84` px de alto (30 por arriba y 54 por abajo para la sombra y el vaivén).

Los **huecos** se numeran desde la activa: `0` es la activa, `1, 2, …` las de su derecha y `−1, −2` las de su izquierda:

```
X(0) = x0
X(k) = x0 + W + G + (k − 1)·(N + G)     si k > 0
X(k) = x0 + k·(N + G)                   si k < 0
ancho(0) = W, ancho(k ≠ 0) = N
```

En cada fotograma, `layout(pos)` coloca cada tarjeta `j`:

1. Calcula a cuántos huecos está de la activa: `r = ((j − pos + 2) mod m) − 2`. El ajuste hace que `r` esté siempre entre −2 y m−2: hay dos tarjetas a la izquierda (casi fuera de la pantalla) y el resto a la derecha.
2. Si `r` tiene decimales (entre dos huecos), interpola posición y ancho entre el hueco `⌊r⌋` y el siguiente.
3. Pone `--k = máx(0, 1 − |r|)`: 1 en la activa y 0 desde un hueco de distancia. El CSS lo usa para que el **título crezca a la vez que la tarjeta**.
4. Marca con `.on` la tarjeta con `|r| < 0,5`.

Las posiciones se escriben directamente (`left`, `width`, `height`) sin transiciones CSS: la suavidad la da el muelle.

## El muelle (spring.js)

Es un **muelle críticamente amortiguado**: llega al objetivo lo más rápido posible sin pasarse ni rebotar, y si el objetivo cambia a mitad de camino conserva la velocidad. Se calcula con la solución exacta de la ecuación:

```
x(t) = objetivo + (d + B·t)·e^(−ω·t),   con d = x₀ − objetivo y B = v₀ + ω·d
```

así que el resultado no depende de cuántos fotogramas por segundo haya. La rigidez `ω` marca la rapidez:

| Uso | ω | Duración aproximada |
|-----|---|---------------------|
| Clic, teclado o al soltar un arrastre (`OMEGA_MANUAL`) | 7 | 0,6 s |
| Avance automático (`OMEGA_AUTO`) | 2,2 | 2 s |

El bucle de animación (`requestAnimationFrame`) sólo corre mientras el muelle se mueve; se para solo cuando está prácticamente quieto en el objetivo. El paso de tiempo se limita a 50 ms por fotograma, para que una pestaña que vuelve de segundo plano no dé un salto.

## Interacciones (carouselController)

- **Clic en una tarjeta lateral**: el carrusel va hasta ella por el camino más corto.
- **Clic en la tarjeta activa** (o en su botón): se abre su pop up (`onOpen`).
- **Arrastre** con ratón o dedo:
  - empieza cuando el puntero se ha movido más de 5 px (por debajo es un clic);
  - "agarra" el carrusel donde esté, aunque se estuviera moviendo, sin saltos;
  - cada `unit()` px de desplazamiento es una tarjeta (`unit = (W + N + 2G) / 2`); con el dedo la sensibilidad es 1,5 veces mayor (`TOUCH_GAIN`);
  - al soltar, se calcula la velocidad del gesto con las últimas 6 muestras; el muelle arranca con esa velocidad (máximo 16 tarjetas/s) y el destino se adelanta hasta 2 tarjetas si el gesto fue rápido;
  - el clic que el navegador lanza al soltar se ignora.
  - `touch-action: pan-y` deja el desplazamiento vertical de la página al navegador, así que arrastrar en vertical sobre el carrusel sigue moviendo la página.
- **Teclado**: con el escenario enfocado (tabulador), ← y → mueven una tarjeta.
- **Cambio de tamaño u orientación**: se recoloca todo al momento.
- **Botón "Ver lista" / "Ver carrusel"**: alterna con la vista de lista; antes, para cualquier vídeo que esté sonando en la lista.

## Avance automático

Cada 6,5 s (`every`) el carrusel avanza una tarjeta, despacio (`OMEGA_AUTO`): hacia la derecha en Lanzamientos y Merch y hacia la izquierda en Videoclips (`dir: -1`). **No avanza** si:

- se está en la vista de lista, arrastrando, o el carrusel ya se está moviendo;
- el ratón está encima del carrusel o el foco está dentro;
- han pasado menos de 12 s (`IDLE_MS`) desde la última interacción con él;
- la persona tiene activado "reducir movimiento";
- la pestaña no está visible, hay un pop up abierto o el carrusel no está en pantalla.

## Colores de la sección

Al cambiar la tarjeta activa, la sección entera cambia de color con una transición de 0,7 s. `theme.js` alterna cuatro combinaciones de la paleta (negro / rojo / negro / gris, con texto blanco o negro) según la tarjeta activa; `carouselView.paint()` las pone en las variables `--sbg` (fondo), `--sfg` (texto) y `--dash` (rayita bajo el título; blanca sobre fondo rojo). En CSS esas variables se declaran con `@property` como colores, que es lo que permite animarlas. En la vista de lista la sección vuelve a los colores normales de la página.

## Aspecto de las tarjetas

- Imagen de fondo con un degradado oscuro abajo para que el texto se lea. Hasta que la imagen carga (o si falla), la tarjeta es de un color de la paleta (`.c0`–`.c3`) con una trama de puntos.
- Etiqueta del tipo en una pastilla semitransparente, siempre en una línea.
- Título que crece con `--k` (de 1,05 a 2,7 rem en ordenador; de 0,85 a 1,6 rem en móvil).
- **"Flotar en el mar"**: cada tarjeta combina tres animaciones CSS con periodos distintos, subir y bajar (6,4 s, ±6 px), balancearse (8,6 s, ±0,6°) y desplazarse (11,3 s, ±4 px). El retraso depende de su posición en el anillo (`--j`), así que parece una ola que pasa de una tarjeta a otra.
- Con ratón, el cursor sobre el escenario es un **anillo** blanco (con `mix-blend-mode: difference`, visible sobre cualquier fondo) que se ensancha al arrastrar.

## Vista de lista

Cada carrusel crea también una lista con una fila por elemento real (sin repeticiones), oculta hasta que se pulsa "Ver lista" (clase `.all` en `.car`). En videoclips, pulsar la miniatura de una fila pone el reproductor de YouTube en su lugar (`playInline`); al volver al carrusel se restaura la miniatura y el vídeo se para.

## Accesibilidad

- El carrusel es una región con descripción "carrusel"; cada tarjeta, un grupo "diapositiva" con su posición ("3 de 6").
- Sólo la tarjeta activa es visible para lectores de pantalla (`aria-hidden` en las demás) y sólo sus botones se alcanzan con el tabulador.
- Con "reducir movimiento" no hay avance automático, vaivén ni transiciones de color.

## Ajustes rápidos

| Qué | Dónde |
|-----|-------|
| Velocidad de los movimientos | `OMEGA_MANUAL`, `OMEGA_AUTO` en `carouselController.js` |
| Cada cuánto avanza solo y la pausa tras interactuar | `every` (parámetro de `initCarousel`, 6500 ms), `IDLE_MS` |
| Sentido del avance automático | `dir` en el controlador de cada sección |
| Sensibilidad del arrastre con el dedo | `TOUCH_GAIN` |
| Tamaños y separaciones de las tarjetas | `metrics()` en `carouselView.js` |
| Colores de las secciones | `STAGE` en `theme.js` |
| Vaivén de las tarjetas | `@keyframes sea-*` al final de `css/carousel.css` |
| Corte móvil / ordenador (820 px) | `metrics()` y las media queries de `css/carousel.css` (hay que cambiarlo en los dos) |
