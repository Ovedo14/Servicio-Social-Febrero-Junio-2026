// ============================================================================
//  GENERADOR DE PDF DE EXPEDIENTES
//  Dibuja el PDF a partir de lo que dice campos.js. No sabe nada de Firebase
//  ni de botones: recibe participantes y devuelve un PDF.
//
//  Uso:
//    const exportador = crearExportador(jsPDF);
//    const { doc, nombreArchivo } = exportador.expediente(participante);
//    doc.save(nombreArchivo);
// ============================================================================

import { ESTILO, ENCABEZADO, SECCIONES, ALERTA } from "./campos.js";

const MM_POR_PT = 0.3528; // 1 punto = 0.3528 mm

export function crearExportador(jsPDF) {
  const { pagina, fuente, colores, tamanos, textos } = ESTILO;

  // ---------- Utilidades de datos ------------------------------------------

  // Lee un dato, aunque esté anidado: leer(p, "tutor.nombre")
  function leer(participante, clave) {
    return clave.split(".").reduce((x, parte) => (x == null ? undefined : x[parte]), participante);
  }

  // Convierte cualquier dato a texto listo para imprimir.
  function aTexto(valor) {
    if (valor == null) return "";
    if (typeof valor.toDate === "function") valor = valor.toDate(); // Timestamp de Firestore
    if (valor instanceof Date) return formatearFecha(valor);
    if (typeof valor === "boolean") return valor ? "Sí" : "No";
    if (Array.isArray(valor)) return valor.map(aTexto).filter(Boolean).join(", ");
    const texto = String(valor).trim();
    const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/); // 2016-08-14 -> 14/08/2016
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    return limpiar(texto);
  }

  function formatearFecha(fecha) {
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${fecha.getFullYear()}`;
  }

  // El PDF usa fuentes estándar: acentos, ñ y signos comunes sí; emojis y
  // símbolos raros no. Aquí se quitan para que no salgan caracteres basura.
  function limpiar(texto) {
    return texto
      .replace(/[^\n\x20-\x7E -ÿ–—‘’“”•…€]/g, "")
      .replace(/ {2,}/g, " ");
  }

  function sinAcentos(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[.!\s]+$/g, "");
  }

  function nombreSeguro(texto) {
    return sinAcentos(String(texto)).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  const etiquetaDe = {};
  SECCIONES.forEach((s) => s.campos.forEach((c) => (etiquetaDe[c.clave] = c.etiqueta)));

  // Devuelve [{ etiqueta, texto }] con lo que dispara la alerta médica.
  function alertasDe(participante) {
    return ALERTA.campos
      .map((clave) => ({ etiqueta: etiquetaDe[clave] || clave, texto: aTexto(leer(participante, clave)) }))
      .filter((a) => a.texto && !ALERTA.ignorar.includes(sinAcentos(a.texto)));
  }

  // ---------- Dibujo --------------------------------------------------------

  const altoLinea = (pt) => pt * MM_POR_PT * 1.3;

  function fijarTexto(doc, { tamano, estilo = "normal", color }) {
    doc.setFont(fuente, estilo);
    doc.setFontSize(tamano);
    doc.setTextColor(...color);
  }

  function nuevoContexto(contexto) {
    const doc = new jsPDF({ unit: "mm", format: pagina.formato, orientation: "portrait" });
    return {
      doc,
      contexto,
      m: pagina.margen,
      ancho: doc.internal.pageSize.getWidth(),
      alto: doc.internal.pageSize.getHeight(),
      y: 0,
      nombreActual: ""
    };
  }

  function dibujarCabecera(ctx) {
    const { doc, m, ancho } = ctx;
    fijarTexto(doc, { tamano: tamanos.cabecera, estilo: "bold", color: colores.acento });
    doc.text(limpiar(textos.documento + (ctx.contexto ? " · " + ctx.contexto : "")), m, m);
    fijarTexto(doc, { tamano: tamanos.cabecera, color: colores.suave });
    doc.text(limpiar(textos.institucion), ancho - m, m, { align: "right" });
    doc.setDrawColor(...colores.linea);
    doc.setLineWidth(0.3);
    doc.line(m, m + 3, ancho - m, m + 3);
    ctx.y = m + 12;
  }

  function nuevaPagina(ctx, continuacion) {
    ctx.doc.addPage();
    dibujarCabecera(ctx);
    if (continuacion && ctx.nombreActual) {
      fijarTexto(ctx.doc, { tamano: tamanos.subtitulo, color: colores.suave });
      ctx.doc.text(`${ctx.nombreActual} (continuación)`, ctx.m, ctx.y);
      ctx.y += 8;
    }
  }

  // Si lo que sigue no cabe en la página, pasa a una nueva.
  function asegurarEspacio(ctx, alto) {
    if (ctx.y + alto > ctx.alto - ctx.m - 8) nuevaPagina(ctx, true);
  }

  function dibujarNombre(ctx, participante) {
    const { doc, m, ancho } = ctx;
    const nombre = aTexto(leer(participante, ENCABEZADO.nombre)) || textos.vacio;
    ctx.nombreActual = nombre;

    fijarTexto(doc, { tamano: tamanos.nombre, estilo: "bold", color: colores.texto });
    const lineas = doc.splitTextToSize(nombre, ancho - 2 * m);
    doc.text(lineas, m, ctx.y + tamanos.nombre * MM_POR_PT);
    ctx.y += lineas.length * altoLinea(tamanos.nombre) + 1;

    const subtitulo = ENCABEZADO.subtitulo
      .map((c) => aTexto(leer(participante, c)))
      .filter(Boolean)
      .join(" · ");
    if (subtitulo) {
      fijarTexto(doc, { tamano: tamanos.subtitulo, color: colores.suave });
      doc.text(subtitulo, m, ctx.y + tamanos.subtitulo * MM_POR_PT);
      ctx.y += altoLinea(tamanos.subtitulo);
    }
    ctx.y += 4;
  }

  function dibujarAlerta(ctx, participante) {
    const alertas = alertasDe(participante);
    if (!alertas.length) return;

    const { doc, m, ancho } = ctx;
    const relleno = 3;
    const anchoCaja = ancho - 2 * m;
    const detalle = alertas.map((a) => `${a.etiqueta}: ${a.texto}`).join("   |   ");

    fijarTexto(doc, { tamano: tamanos.alerta, estilo: "bold", color: colores.alerta });
    const lineas = doc.splitTextToSize(detalle, anchoCaja - 2 * relleno);
    const altoCaja = relleno * 2 + altoLinea(tamanos.alerta) * (lineas.length + 1);

    asegurarEspacio(ctx, altoCaja);
    doc.setFillColor(...colores.alertaFondo);
    doc.roundedRect(m, ctx.y, anchoCaja, altoCaja, 2, 2, "F");

    let y = ctx.y + relleno + tamanos.alerta * MM_POR_PT;
    doc.text("ALERTA MÉDICA", m + relleno, y, { charSpace: 0.3 });
    y += altoLinea(tamanos.alerta);
    fijarTexto(doc, { tamano: tamanos.alerta, color: colores.alerta });
    doc.text(lineas, m + relleno, y);
    ctx.y += altoCaja + 6;
  }

  function dibujarSeccion(ctx, participante, seccion) {
    const { doc, m, ancho } = ctx;
    const separacion = 8;
    const anchoColumna = (ancho - 2 * m - separacion) / 2;
    const anchoTotal = ancho - 2 * m;

    // Título de la sección (si cae al final de la página, se va con su primera fila)
    asegurarEspacio(ctx, 24);
    fijarTexto(doc, { tamano: tamanos.seccion, estilo: "bold", color: colores.acento });
    doc.text(limpiar(seccion.titulo.toUpperCase()), m, ctx.y + tamanos.seccion * MM_POR_PT, { charSpace: 0.4 });
    ctx.y += altoLinea(tamanos.seccion) + 0.5;
    doc.setDrawColor(...colores.linea);
    doc.setLineWidth(0.3);
    doc.line(m, ctx.y, ancho - m, ctx.y);
    ctx.y += 3;

    // Se agrupan los campos en filas de hasta 2 columnas.
    const filas = [];
    for (let i = 0; i < seccion.campos.length; i++) {
      const campo = seccion.campos[i];
      const siguiente = seccion.campos[i + 1];
      if (!campo.completo && siguiente && !siguiente.completo) {
        filas.push([campo, siguiente]);
        i++;
      } else {
        filas.push([campo]);
      }
    }

    for (const fila of filas) {
      const celdas = fila.map((campo) => {
        const anchoCelda = campo.completo ? anchoTotal : anchoColumna;
        fijarTexto(doc, { tamano: tamanos.valor, color: colores.texto });
        const texto = aTexto(leer(participante, campo.clave)) || textos.vacio;
        return { campo, lineas: doc.splitTextToSize(texto, anchoCelda), anchoCelda };
      });
      const alto =
        Math.max(...celdas.map((c) => c.lineas.length)) * altoLinea(tamanos.valor) +
        altoLinea(tamanos.etiqueta) +
        3;

      // Un texto tan largo que no cabe ni en una página completa se reparte línea por línea.
      const maximoPorPagina = ctx.alto - 2 * ctx.m - 30;
      if (celdas.length === 1 && alto > maximoPorPagina) {
        const { campo, lineas } = celdas[0];
        asegurarEspacio(ctx, altoLinea(tamanos.etiqueta) + altoLinea(tamanos.valor));
        fijarTexto(doc, { tamano: tamanos.etiqueta, color: colores.suave });
        doc.text(limpiar(campo.etiqueta), m, ctx.y + tamanos.etiqueta * MM_POR_PT);
        ctx.y += altoLinea(tamanos.etiqueta);
        for (const linea of lineas) {
          asegurarEspacio(ctx, altoLinea(tamanos.valor));
          fijarTexto(doc, { tamano: tamanos.valor, color: colores.texto });
          doc.text(linea, m, ctx.y + tamanos.valor * MM_POR_PT);
          ctx.y += altoLinea(tamanos.valor);
        }
        ctx.y += 3;
        continue;
      }

      asegurarEspacio(ctx, alto);

      celdas.forEach((celda, i) => {
        const x = m + i * (anchoColumna + separacion);
        fijarTexto(doc, { tamano: tamanos.etiqueta, color: colores.suave });
        doc.text(limpiar(celda.campo.etiqueta), x, ctx.y + tamanos.etiqueta * MM_POR_PT);
        fijarTexto(doc, { tamano: tamanos.valor, color: colores.texto });
        doc.text(celda.lineas, x, ctx.y + altoLinea(tamanos.etiqueta) + tamanos.valor * MM_POR_PT);
      });
      ctx.y += alto;
    }
    ctx.y += 3;
  }

  function dibujarExpediente(ctx, participante) {
    dibujarNombre(ctx, participante);
    dibujarAlerta(ctx, participante);
    SECCIONES.forEach((seccion) => dibujarSeccion(ctx, participante, seccion));
  }

  // Pie de página con fecha y número de página, en todas las páginas.
  function dibujarPies(ctx) {
    const { doc, m, ancho, alto } = ctx;
    const total = doc.getNumberOfPages();
    const generado = `Generado el ${formatearFecha(new Date())}`;
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      fijarTexto(doc, { tamano: tamanos.pie, color: colores.suave });
      doc.text(limpiar(`${textos.pie} · ${generado}`), m, alto - m + 4);
      doc.text(`Página ${i} de ${total}`, ancho - m, alto - m + 4, { align: "right" });
    }
  }

  function construir(participantes, contexto) {
    if (!participantes || !participantes.length) {
      throw new Error("No hay participantes para exportar con estos filtros.");
    }
    const ctx = nuevoContexto(contexto);
    dibujarCabecera(ctx);
    participantes.forEach((participante, i) => {
      if (i > 0) nuevaPagina(ctx, false); // cada expediente empieza en página nueva
      dibujarExpediente(ctx, participante);
    });
    dibujarPies(ctx);
    return ctx.doc;
  }

  const porNombre = (a, b) => aTexto(a.nombre).localeCompare(aTexto(b.nombre), "es");
  const porCursoYNombre = (a, b) => aTexto(a.curso).localeCompare(aTexto(b.curso), "es") || porNombre(a, b);

  // ---------- Lo que se usa desde afuera ------------------------------------

  return {
    // PDF de una sola persona
    expediente(participante) {
      const doc = construir([participante], "");
      return { doc, nombreArchivo: `Expediente_${nombreSeguro(aTexto(participante.nombre) || "participante")}.pdf` };
    },

    // PDF con todos los de un curso (un grupo)
    grupo(participantes, { curso, periodo, anio } = {}) {
      const etiqueta = [curso, periodo, anio].filter(Boolean).join(" · ");
      const doc = construir([...participantes].sort(porNombre), etiqueta);
      const nombreArchivo = ["Expedientes", curso, periodo, anio].filter(Boolean).map(nombreSeguro).join("_") + ".pdf";
      return { doc, nombreArchivo };
    },

    // PDF con todos los participantes (de todos los cursos)
    general(participantes, { periodo, anio } = {}) {
      const etiqueta = ["Todos los cursos", periodo, anio].filter(Boolean).join(" · ");
      const doc = construir([...participantes].sort(porCursoYNombre), etiqueta);
      const nombreArchivo = ["Expedientes", "todos", periodo, anio].filter(Boolean).map(nombreSeguro).join("_") + ".pdf";
      return { doc, nombreArchivo };
    }
  };
}
