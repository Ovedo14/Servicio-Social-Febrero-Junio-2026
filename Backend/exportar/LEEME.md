# Descarga de expedientes en PDF

Genera el PDF del expediente médico **por persona**, **por grupo (curso)** y **general**,
directamente en el navegador (no se manda nada a un servidor).

## Archivos

| Archivo | Para qué sirve | ¿Se edita? |
|---|---|---|
| `campos.js` | Colores, tipos de letra, textos y **qué campos lleva el PDF** | **Sí**, aquí se cambia todo lo visual |
| `pdfExpediente.js` | Dibuja el PDF | No, salvo cambios de diseño profundos |
| `datos.js` | De dónde salen los participantes (hoy: datos de prueba) | Sí, al conectar Firebase |
| `panelExport.js` | Conecta los botones del panel con el generador | Normalmente no |
| `vendor/jspdf-4.2.1.umd.min.js` | Librería jsPDF (licencia MIT), copiada tal cual | No |

## Cómo funcionan los botones

Cualquier botón o enlace con el atributo `data-exportar` descarga un PDF. Sirve también
para botones creados desde JavaScript (por ejemplo, las filas que se dibujen desde Firebase).

```html
<button data-exportar="persona" data-id="p-001">Descargar</button>      <!-- un participante -->
<button data-exportar="grupo" data-curso="Manitas Creativas">…</button> <!-- un curso -->
<button data-exportar="general">Exportar</button>                       <!-- según los filtros -->
```

`general` usa los filtros del panel (`#filtro-curso`, `#filtro-periodo`, `#filtro-anio`):
con "Todos los cursos" descarga a todos; con un curso elegido descarga solo ese grupo.
Cambiando el año a uno anterior se descargan los grupos históricos.

## Para conectar Firebase

1. En `datos.js`, reemplazar las dos funciones (`obtenerParticipantes` y `obtenerParticipante`)
   por consultas a Firestore. Deben devolver objetos con la forma descrita arriba del archivo.
2. Si los nombres de los datos en Firestore son distintos, cambiar las `clave` en `campos.js`.
3. Que solo los administradores puedan leer esos datos se logra con el login y con las
   **reglas de Firestore** (son datos médicos de menores). El PDF por sí solo no protege nada.

## Para probar en tu computadora

Los módulos de JavaScript no funcionan abriendo el HTML con doble clic. Usa la extensión
**Live Server** de Visual Studio Code (clic derecho en `AdminPanel.html` → *Open with Live Server*).

Nota: si al publicar con Firebase Hosting solo se sube la carpeta `Frontend`, hay que mover o
copiar `Backend/exportar` dentro de ella y ajustar las rutas de los `<script>` en `AdminPanel.html`.
