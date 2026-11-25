# Pruebas ejecutadas

Fecha de la última pasada: 25 de noviembre de 2026, sobre este repositorio, en Linux. No se ha ejecutado en un Windows físico. El arranque de Windows queda en `iniciar.bat` y `iniciar.ps1`, y el servidor es el mismo `npm run dev`.

## Automatizadas

`npx vitest run` — 10 pruebas, todas en verde (Vitest 3.2.7, 25 nov 2026, 01:41 CET).

Cubren:

- Seis plantillas con composición, tipografía y firma distintas.
- Ocultar la sección Carta la quita del HTML.
- Las seis plantillas superan el control de calidad sin errores ni bloqueadores, con advertencia de datos ficticios.
- Un teléfono vacío y un JavaScript inválido son bloqueadores.
- El ZIP de las tres demostraciones incluye `index.html`, `styles.css`, `site.js` y `LEEME.txt`, y no apunta a Studio.
- El menú, el formulario y el comparador antes/después se ejecutan en JSDOM.
- En la vista previa, el enlace interno no dispara la navegación del documento. En el JavaScript exportado, ese atajo no está.
- El estado «preparado para entrega» se bloquea sin un control vigente y se vuelve a bloquear si el contenido cambia.
- Duplicar conserva la marca y limpia el informe.
- Recargar el mismo almacén recupera el proyecto.
- Un JSON corrupto no se pisa.
- El panel de demostración cuenta un proyecto en producción, uno en revisión y uno pendiente de aprobación.

`npx tsc --noEmit` terminó sin errores.

`npx vite build` generó `dist/` el 25 nov 2026. Avisó de que el JavaScript de la aplicación supera 500 kB (527 kB, 159 kB gzip). La web exportada no arrastra ese paquete.

## Navegador

Chromium, con la aplicación en `http://127.0.0.1:5173`.

- El panel abre con 3 proyectos activos y, tras editar y pasar calidad, el tiempo medido y la actividad cambian.
- La galería muestra seis tarjetas con vistas reales. Se recorrió a 1440 px y a 390 px, en modo oscuro y claro.
- En la vista móvil de Restaurante, Menú y después Carta dejan a la vista «Lo que sale de la cocina» y «Tartar de gamba roja». El marco no carga Studio.
- En el editor de Obradores del Turia, cambiar el título o el nombre comercial se ve en la vista previa sin pulsar guardar.
- El informe de WEB-1002 dio 0 errores y 0 bloqueadores, con 2 advertencias de datos ficticios.
- El ZIP de Obradores del Turia se descargó, se descomprimió y `index.html` se abrió con `file://`. El título de la obra estaba, el formulario confirmó el registro local y la versión móvil reorganizó las secciones.
- La web exportada no contiene `localhost:5173` ni el código de Studio.

Capturas en `docs/capturas/`.
