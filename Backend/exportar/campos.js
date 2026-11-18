// ============================================================================
//  CONFIGURACIÓN DE LOS PDF
//  Para cambiar cómo se ve el PDF o qué campos lleva, edita SOLO este archivo.
//  Los otros archivos (pdfExpediente.js, panelExport.js) no necesitan tocarse.
// ============================================================================

// --- ESTILO: colores, tamaños de letra y textos fijos ------------------------
// Los colores son [rojo, verde, azul] de 0 a 255 (los mismos del panel).
export const ESTILO = {
  pagina: { formato: "letter", margen: 18 }, // "letter" = Carta. Margen en mm.
  fuente: "helvetica",                       // helvetica | times | courier

  colores: {
    texto: [27, 42, 74],         // texto principal
    suave: [107, 122, 153],      // etiquetas y textos secundarios
    linea: [227, 233, 243],      // líneas divisorias
    acento: [30, 58, 138],       // azul marino (títulos de sección)
    alerta: [180, 35, 35],       // rojo de la alerta médica
    alertaFondo: [253, 234, 234] // fondo rosa de la alerta médica
  },

  // Tamaños en puntos (pt)
  tamanos: {
    cabecera: 9,
    nombre: 20,
    subtitulo: 10,
    seccion: 8,
    etiqueta: 8,
    valor: 10,
    alerta: 9,
    pie: 8
  },

  textos: {
    documento: "Expediente médico",
    institucion: "Campus Estado de México",
    pie: "Documento confidencial · contiene datos médicos de menores",
    vacio: "—" // lo que se muestra cuando un campo no tiene dato
  }
};

// --- ENCABEZADO DE CADA EXPEDIENTE ------------------------------------------
// Nombre grande y, debajo, una línea con estos campos separados por " · ".
export const ENCABEZADO = {
  nombre: "nombre",
  subtitulo: ["curso", "periodo", "anio"]
};

// --- SECCIONES Y CAMPOS ------------------------------------------------------
// OJO: estos campos son una PROPUESTA basada en el panel (alergias, condiciones,
// tutor, curso...). Hay que compararlos con el Google Forms que se manda a
// Tec Med y ajustarlos: agregar, quitar o renombrar lo que haga falta.
//
//   clave:    nombre del dato en Firebase. Con punto si está anidado ("tutor.nombre").
//   etiqueta: lo que se imprime en el PDF.
//   completo: true = el campo ocupa todo el ancho (útil para textos largos).
export const SECCIONES = [
  {
    titulo: "Participante",
    campos: [
      { clave: "fechaNacimiento", etiqueta: "Fecha de nacimiento" },
      { clave: "edad", etiqueta: "Edad" },
      { clave: "sexo", etiqueta: "Sexo" },
      { clave: "curso", etiqueta: "Curso" }
    ]
  },
  {
    titulo: "Padre, madre o tutor",
    campos: [
      { clave: "tutor.nombre", etiqueta: "Nombre" },
      { clave: "tutor.parentesco", etiqueta: "Parentesco" },
      { clave: "tutor.telefono", etiqueta: "Teléfono" },
      { clave: "tutor.correo", etiqueta: "Correo electrónico" }
    ]
  },
  {
    titulo: "Contacto de emergencia",
    campos: [
      { clave: "emergencia.nombre", etiqueta: "Nombre" },
      { clave: "emergencia.parentesco", etiqueta: "Parentesco" },
      { clave: "emergencia.telefono", etiqueta: "Teléfono" }
    ]
  },
  {
    titulo: "Información médica",
    campos: [
      { clave: "medico.tipoSangre", etiqueta: "Tipo de sangre" },
      { clave: "medico.seguro", etiqueta: "Seguro médico" },
      { clave: "medico.alergias", etiqueta: "Alergias", completo: true },
      { clave: "medico.condiciones", etiqueta: "Condiciones o padecimientos", completo: true },
      { clave: "medico.medicamentos", etiqueta: "Medicamentos", completo: true },
      { clave: "medico.observaciones", etiqueta: "Observaciones", completo: true }
    ]
  }
];

// --- ALERTA MÉDICA -----------------------------------------------------------
// Si alguno de estos campos trae información, el expediente muestra un recuadro
// rojo al inicio. Las respuestas de "ignorar" cuentan como "sin alerta".
export const ALERTA = {
  campos: ["medico.alergias", "medico.condiciones"],
  ignorar: ["ninguna", "ninguno", "no", "n/a", "na", "no aplica", "sin alergias", "sin condiciones", "-"]
};
