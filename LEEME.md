# Caja de Experimento Físico — Proyecto de Rubén Concepcion

Esta carpeta editable mantiene la estructura modular para Visual Studio Code (`index.html`, `css/`, `js/`, `vendor/`, `LEEME.md`, `DEPENDENCIAS.md` e `INICIAR_WINDOWS.bat`) incorporando todas las mecánicas de scroll, la caja exterior tipo banquete, los cuadros laterales en tono chocolate suave transparente y el sistema interactivo de regalos en las esquinas.

## ¿Es seguro subir este proyecto a GitHub? ¿Qué son `vendor`, `.bat` y `.md`?

* **Seguridad total en GitHub**: Subir esta carpeta a un repositorio de GitHub o publicarla en GitHub Pages **no genera ninguna vulnerabilidad en tu computadora**. Todos los archivos son código front-end estático.
* **`INICIAR_WINDOWS.bat`**: Es un pequeño script de 6 líneas de texto para Windows que ejecuta `py -m http.server 8000 --bind 127.0.0.1`. La dirección `127.0.0.1` significa que el servidor local solo es accesible dentro de tu propia máquina mientras haces pruebas en Visual Studio Code. GitHub Pages ignora los archivos `.bat` y sirve directamente `index.html`.
* **`vendor/`**: Es la carpeta donde se guardan las bibliotecas gráficas de terceros (`three.module.js`, `OrbitControls.js`, `SVGRenderer.js`, `Projector.js` y `gsap.min.js`) para que el proyecto funcione localmente sin depender de descargas externas.
* **`LEEME.md` y `DEPENDENCIAS.md`**: Los archivos con extensión `.md` (Markdown) son guías de lectura y documentación legibles por cualquier editor de texto o por la portada de GitHub; no ejecutan código.

## Novedades implementadas en esta versión

1. **Sin barra lateral (Simulador 3D en el centro + Cuadros chocolate translúcidos a los lados)**:
   * El modelo 3D ocupa el centro de la pantalla. A izquierda y derecha flotan cuadros de información con fondo color chocolate suave transparente (`rgba(74, 46, 30, 0.56)`), tipografía serif elegante y el crédito de su creador **Rubén Concepcion**.
   * Al hacer scroll entre secciones, los cuadros se atenúan suavemente y reaparecen con la información de la experiencia activa sin tapar el estilo de los modelos 3D.
2. **Caja exterior tipo banquete (`cubiertaBanquete`)**:
   * En la página principal (**Scroll 00**), las tres cajas de experimento están encerradas dentro de una cubierta exterior tipo banquete con paredes de vidrio reflectante y asa superior de latón.
   * Al hacer scroll hacia abajo (**Scroll 01**), la caja tipo banquete se abre elevándose hacia arriba, deja ver reflejados los tres montajes con sus ventanas de vidrio en ambos lados y acerca el primer montaje hacia ti.
3. **Bloqueo de Scroll por experiencia (`Scroll Gate`)**:
   * En el **Scroll 01 (Experimento 1)**, el scroll hacia la Caja 2 permanece bloqueado hasta que se completa físicamente la primera experiencia. Lo mismo ocurre en el **Scroll 02** respecto a la Caja 3.
4. **Regalos en las esquinas, animación «¡puf!» y objetos interactivos dentro del hormiguero**:
   * Cada caja tiene ventanas de vidrio por ambos lados y paredes internas tipo hormiguero.
   * En la esquina inferior derecha se ubica el regalo cerrado de esa sección. Al darle clic o arrastrarlo, se mueve dentro del área cerrada del hormiguero sin poder salir.
   * Al completar el experimento, se abre el sello de la esquina, sale el regalo, vuelve la caja actual, avanza la siguiente caja y el regalo entra en la cajilla de regalos superior (*un poco arriba del regalo de la nueva sección*), abriéndose con un efecto **«¡puf!»** y dejando el objeto ganado adentro (que también se mueve al hacerle clic dentro de su recinto de vidrio).
