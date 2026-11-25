# Limitaciones conocidas

- Cada plantilla es una sola página larga. No hay editor libre de arrastrar y soltar.
- Las fotografías de demostración son láminas SVG. Una imagen propia se incluye al subirla en el editor.
- Los formularios no salen del dispositivo. El mapa es un enlace a OpenStreetMap, no un mapa incrustado. Las tipografías web piden Google Fonts y, sin red, el navegador usa la familia de reserva.
- El control de calidad revisa la sintaxis del JavaScript y la estructura de la página. No ejecuta el script en un navegador. Esa ejecución se comprobó aparte, en las pruebas de la guía de pruebas.
- Un enlace interno de la vista previa se desplaza dentro del marco. En el ZIP, el mismo enlace usa la navegación normal del archivo HTML.
- `localStorage` tiene un límite aproximado de 5 MB por origen. Las imágenes grandes se reducen antes de guardarse. Conviene descargar la copia JSON si el archivo importa.
- No hay cuentas de usuario. Quien abre el navegador ve los proyectos de ese navegador.
- La build de `dist/` usa el enrutado del navegador. Para verla hace falta `npm run preview`. El archivo `dist/index.html` no funciona al abrirlo directamente. La web exportada sí.
- ComeCerca y el resto de Ideark no están conectados. El pie de la plantilla de restaurante lo dice.
- Care, IA, Automatizaciones y Aplicaciones no están operativos.
