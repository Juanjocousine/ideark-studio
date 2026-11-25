# Arquitectura

Ideark Studio es una aplicación de una sola página. Vite sirve la interfaz y el navegador guarda el trabajo. No hay base de datos ni servidor de proyectos.

## Piezas

- `src/site/` genera la web. La vista previa y el ZIP usan el mismo `renderBody` y el mismo CSS de cada plantilla. La vista previa incrusta el CSS y el JavaScript. La exportación los deja en `styles.css` y `site.js`.
- `src/site/registry.ts` es el catálogo. Una plantilla nueva se añade aquí y en `src/site/templates/`.
- `src/site/qa.ts` analiza el HTML, el CSS y el JavaScript del paquete exportable. No puntúa una captura.
- `src/studio/store.ts` guarda proyectos, historial, incidencias, informes, exportaciones y tiempos. La clave es `ideark.studio.v1`. Un JSON ilegible no se sobrescribe: la interfaz ofrece descargarlo y restaurar las demostraciones.
- `src/contracts/ideark.ts` reserva identificadores para Comercial, Experience, Central y Radar. No hay llamadas de red.

## Estados

Nuevo, pendiente de información, preparación, en producción, revisión interna, pendiente de aprobación, correcciones, aprobado, preparado para entrega, entregado y en mantenimiento. Cada cambio queda en el historial. Nada se publica solo.

«Preparado para entrega» y «Entregado» exigen un control de calidad vigente, sin errores ni bloqueadores, sobre la revisión actual del contenido. Las advertencias, incluidas las de datos ficticios identificados, no bloquean.

## Tiempos

Se miden por separado la creación, la personalización en el editor, la revisión del informe y la generación del ZIP. El total es la suma de esas mediciones. Una estimación manual puede anotarse al lado. No se calcula ningún ahorro.

## Exportación

El ZIP contiene una carpeta con la web. Los textos se escapan. Los colores solo entran si son hexadecimales. Las tipografías salen de una lista cerrada. Las imágenes subidas se reducen en el navegador y viajan en `assets/`. Las láminas de demostración son SVG incrustados. Los formularios confirman el envío en el propio dispositivo y no llaman a ningún servidor.

Servicios externos, descritos en `LEEME.txt`: Google Fonts, el enlace a OpenStreetMap y `wa.me`.
