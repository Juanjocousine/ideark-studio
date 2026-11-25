# Ideark Studio 1.0

Fábrica digital local para producir páginas web. Esta versión hace operativos Studio Web, Proyectos, Activos y Calidad. Care, IA, Automatizaciones y Aplicaciones aparecen como módulos futuros y no ejecutan nada.

Los datos de ejemplo son ficticios y están marcados como demostración. No hay conexión con ComeCerca, Ideark Comercial, Experience, Central ni Radar.

## Abrir en este equipo

Con las dependencias ya instaladas:

```bash
npm run dev
```

La aplicación queda en [http://localhost:5173](http://localhost:5173).

## Arranque en Windows

1. Instalar [Node.js 20](https://nodejs.org) o superior.
2. Descomprimir o clonar el repositorio.
3. Hacer doble clic en `iniciar.bat` (o, en PowerShell, `.\iniciar.ps1`).
4. El script instala dependencias la primera vez y abre el servidor.
5. Abrir [http://localhost:5173](http://localhost:5173).
6. Cerrar la ventana de la consola detiene la aplicación.

Los proyectos se guardan en el navegador (`localStorage`, clave `ideark.studio.v1`). Siguen ahí al cerrar la ventana. Desde la barra lateral se puede descargar y restaurar una copia JSON.

## Qué se puede hacer

1. Elegir una de las seis plantillas en la galería.
2. Crear un proyecto, personalizarlo en el editor y ver el cambio al momento.
3. Guardar, cerrar y volver a abrir el mismo proyecto.
4. Duplicarlo.
5. Ejecutar el control de calidad sobre la web exportable.
6. Descargar un ZIP con `index.html`, `styles.css`, `site.js`, `LEEME.txt` y las imágenes subidas.
7. Abrir `index.html` del ZIP sin Ideark Studio.

Hay tres proyectos de demostración: Mar de Olivos (restaurante), Obradores del Turia (reformas) y Clínica Alba Norte (clínica). No representan negocios reales.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor local en el puerto 5173 |
| `npm test` | Pruebas automatizadas |
| `npm run build` | Comprueba TypeScript y genera `dist/` |
| `npm run preview` | Sirve la build en el puerto 4173 |

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Guía de uso](docs/GUIA.md)
- [Pruebas ejecutadas](docs/PRUEBAS.md)
- [Limitaciones](docs/LIMITACIONES.md)
- Capturas en `docs/capturas/`

## Siguientes prioridades

1. Editor con arrastrar y soltar, y páginas de más de una vista.
2. Biblioteca de fotografías propias, en lugar de las láminas SVG de demostración.
3. Contratos oficiales con Comercial, Experience, Central y Radar.
4. Integración real con ComeCerca, solo cuando exista ese contrato.
5. Módulos Care, IA, Automatizaciones y Aplicaciones.
6. Control de calidad con ejecución real del JavaScript en un navegador, no solo la comprobación de sintaxis.
