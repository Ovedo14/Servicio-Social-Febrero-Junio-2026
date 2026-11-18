// ============================================================================
//  DE DÓNDE SALEN LOS DATOS
//  Por ahora son DATOS DE PRUEBA (inventados) porque el formulario todavía no
//  guarda nada en Firebase. Cuando haya datos reales, solo hay que cambiar las
//  dos funciones de abajo; el resto del código no se toca.
//
//  Forma que debe tener cada participante (los nombres deben coincidir con las
//  "clave" de campos.js):
//
//    {
//      id: "p-001", nombre: "...", fechaNacimiento: "2016-08-14", edad: 9,
//      sexo: "...", curso: "Manitas Creativas", periodo: "Verano", anio: 2026,
//      tutor:      { nombre, parentesco, telefono, correo },
//      emergencia: { nombre, parentesco, telefono },
//      medico:     { tipoSangre, seguro, alergias, condiciones, medicamentos, observaciones }
//    }
// ============================================================================

const PARTICIPANTES_PRUEBA = [
  {
    id: "p-001",
    nombre: "Sofía Ramírez",
    fechaNacimiento: "2016-08-14",
    edad: 9,
    sexo: "Femenino",
    curso: "Manitas Creativas",
    periodo: "Verano",
    anio: 2026,
    tutor: { nombre: "Ana Ramírez", parentesco: "Madre", telefono: "55 1234 5678", correo: "ana.ramirez@correo.com" },
    emergencia: { nombre: "Luis Ramírez", parentesco: "Abuelo", telefono: "55 8765 4321" },
    medico: {
      tipoSangre: "O+",
      seguro: "IMSS",
      alergias: "Penicilina y cacahuate",
      condiciones: "Asma leve",
      medicamentos: "Inhalador de salbutamol en caso de crisis",
      observaciones: "Lleva su inhalador en la mochila."
    }
  },
  {
    id: "p-002",
    nombre: "Mateo Hernández Cruz",
    fechaNacimiento: "2018-03-02",
    edad: 7,
    sexo: "Masculino",
    curso: "Pequeños Héroes",
    periodo: "Verano",
    anio: 2026,
    tutor: { nombre: "Laura Cruz", parentesco: "Madre", telefono: "55 2222 3333", correo: "laura.cruz@correo.com" },
    emergencia: { nombre: "Jorge Hernández", parentesco: "Padre", telefono: "55 4444 5555" },
    medico: { tipoSangre: "A+", seguro: "Particular", alergias: "Ninguna", condiciones: "Ninguna", medicamentos: "", observaciones: "" }
  },
  {
    id: "p-003",
    nombre: "Íñigo Muñoz Ávila",
    fechaNacimiento: "2015-11-21",
    edad: 10,
    sexo: "Masculino",
    curso: "VeranoExploraTec",
    periodo: "Verano",
    anio: 2026,
    tutor: { nombre: "Patricia Ávila", parentesco: "Madre", telefono: "55 6666 7777", correo: "patricia.avila@correo.com" },
    emergencia: { nombre: "Raúl Muñoz", parentesco: "Padre", telefono: "55 8888 9999" },
    medico: {
      tipoSangre: "B-",
      seguro: "ISSSTE",
      alergias: "Picaduras de abeja (reacción fuerte)",
      condiciones: "Ninguna",
      medicamentos: "",
      // Texto largo a propósito, para probar que el PDF lo acomoda en varias líneas
      observaciones:
        "Requiere vigilancia en actividades al aire libre. En caso de picadura debe recibir atención médica de inmediato; sus padres solicitan que se les llame antes de cualquier otro paso. Usa lentes para leer y no debe quedarse sin ellos durante las actividades de lectura y manualidades. Se pone nervioso en espacios muy ruidosos."
    }
  },
  {
    id: "p-004",
    nombre: "Diego Martínez Salas",
    fechaNacimiento: "2013-06-30",
    edad: 12,
    sexo: "Masculino",
    curso: "TTF — Tocho",
    periodo: "Verano",
    anio: 2026,
    tutor: { nombre: "Carmen Salas", parentesco: "Madre", telefono: "55 1010 2020", correo: "carmen.salas@correo.com" },
    emergencia: { nombre: "Pedro Martínez", parentesco: "Padre", telefono: "55 3030 4040" },
    medico: { tipoSangre: "O-", seguro: "GNP", alergias: "Ninguna", condiciones: "Esguince de tobillo anterior (recuperado)", medicamentos: "", observaciones: "" }
  },
  {
    id: "p-005",
    nombre: "Camila Torres",
    fechaNacimiento: "2016-01-09",
    edad: 9,
    sexo: "Femenino",
    curso: "Manitas Creativas",
    periodo: "Verano",
    anio: 2025, // grupo histórico: también se puede descargar
    tutor: { nombre: "Elena Torres", parentesco: "Madre", telefono: "55 5050 6060", correo: "elena.torres@correo.com" },
    emergencia: { nombre: "Marta Torres", parentesco: "Tía", telefono: "55 7070 8080" },
    medico: { tipoSangre: "AB+", seguro: "IMSS", alergias: "Ninguna", condiciones: "Ninguna", medicamentos: "", observaciones: "" }
  }
];

// Devuelve los participantes que cumplan los filtros. Un filtro vacío = "todos".
// TODO (cuando haya Firebase): reemplazar el cuerpo por una consulta a Firestore
// con los mismos filtros (curso, periodo, anio).
export async function obtenerParticipantes({ curso = "", periodo = "", anio = "" } = {}) {
  return PARTICIPANTES_PRUEBA.filter(
    (p) =>
      (!curso || p.curso === curso) &&
      (!periodo || p.periodo === periodo) &&
      (!anio || String(p.anio) === String(anio))
  );
}

// Devuelve un solo participante por su id (o undefined si no existe).
// TODO (cuando haya Firebase): leer el documento con ese id.
export async function obtenerParticipante(id) {
  return PARTICIPANTES_PRUEBA.find((p) => p.id === id);
}
