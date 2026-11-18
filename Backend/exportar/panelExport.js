// ============================================================================
//  BOTONES DE DESCARGA DEL PANEL
//  Escucha los clics en cualquier elemento que tenga el atributo data-exportar.
//  No importa quién cree el botón (HTML fijo o JavaScript): si tiene el atributo,
//  funciona. Así, las filas que se dibujen desde Firebase también descargan.
//
//    <button data-exportar="persona" data-id="p-001">Descargar PDF</button>
//    <button data-exportar="grupo" data-curso="Manitas Creativas">…</button>
//    <button data-exportar="general">Exportar</button>
//
//  "general" respeta los filtros de arriba del panel (curso, periodo y año):
//  con "Todos los cursos" baja a todos; con un curso elegido baja solo ese grupo.
// ============================================================================

import { crearExportador } from "./pdfExpediente.js";
import { obtenerParticipantes, obtenerParticipante } from "./datos.js";

// jsPDF se carga con una etiqueta <script> en AdminPanel.html
if (!window.jspdf) {
  console.error("No se cargó la librería jsPDF; revisa la etiqueta <script> de AdminPanel.html");
}
const exportador = window.jspdf ? crearExportador(window.jspdf.jsPDF) : null;

// Lee lo que está elegido en los filtros del panel ("" = todos)
function filtrosActuales() {
  const valor = (id) => (document.getElementById(id) ? document.getElementById(id).value : "");
  return { curso: valor("filtro-curso"), periodo: valor("filtro-periodo"), anio: valor("filtro-anio") };
}

async function generar(boton) {
  const tipo = boton.dataset.exportar;

  if (tipo === "persona") {
    const participante = await obtenerParticipante(boton.dataset.id);
    if (!participante) throw new Error("No se encontró a este participante.");
    return exportador.expediente(participante);
  }

  if (tipo === "grupo") {
    const filtros = { ...filtrosActuales(), curso: boton.dataset.curso };
    return exportador.grupo(await obtenerParticipantes(filtros), filtros);
  }

  if (tipo === "general") {
    const filtros = filtrosActuales();
    const participantes = await obtenerParticipantes(filtros);
    return filtros.curso ? exportador.grupo(participantes, filtros) : exportador.general(participantes, filtros);
  }

  throw new Error(`Tipo de descarga desconocido: ${tipo}`);
}

document.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("[data-exportar]");
  if (!boton) return;
  evento.preventDefault();

  if (!exportador) return alert("No se pudo cargar el generador de PDF. Revisa tu conexión e intenta de nuevo.");
  if (boton.getAttribute("aria-busy") === "true") return; // evita doble clic

  boton.setAttribute("aria-busy", "true");
  try {
    const { doc, nombreArchivo } = await generar(boton);
    doc.save(nombreArchivo);
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo generar el PDF.");
  } finally {
    boton.removeAttribute("aria-busy");
  }
});
