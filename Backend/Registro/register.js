/**
 * TEC MED | Solicitud de alta de administradores
 * Autora del modulo: Jimena Olvera
 *
 * No crea usuarios directamente desde el navegador. Solo valida los datos
 * y manda la solicitud a `servicioRegistro`, que se conectara mas adelante.
 *
 * Contrato de servicioRegistro:
 *   crearAdministrador({ nombre, correo }) -> Promise<{ ok: true, uid?: string }>
 *
 * REQUISITO DE SEGURIDAD: el servidor/Firebase Cloud Function debe verificar
 * el token del administrador actual y sus permisos ANTES de crear otra cuenta.
 * Nunca confiar en un campo `esAdmin` enviado desde el formulario.
 *
 * La configuracion final decidira como se invita al nuevo administrador
 * para establecer su propia contrasena; no enviar contrasenas provisionales.
 */

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarNuevoAdministrador(datos = {}) {
  const nombre = typeof datos?.nombre === "string"
    ? datos.nombre.trim().replace(/\s+/g, " ")
    : "";
  const correo = typeof datos?.correo === "string" ? datos.correo.trim() : "";

  if (!nombre || !correo) {
    throw new Error("Debes ingresar nombre y correo del nuevo administrador.");
  }

  if (nombre.length < 2 || nombre.length > 120 || /[\x00-\x1F\x7F]/.test(nombre)) {
    throw new Error("Ingresa un nombre válido (entre 2 y 120 caracteres).");
  }

  if (correo.length > 254 || !FORMATO_CORREO.test(correo)) {
    throw new Error("Ingresa un correo electrónico válido.");
  }

  // Nunca aceptar rol, permisos ni contrasenas del formulario publico.
  return { nombre, correo };
}

export async function solicitarRegistroAdministrador(datos, servicioRegistro) {
  const administradorNuevo = validarNuevoAdministrador(datos);

  if (typeof servicioRegistro?.crearAdministrador !== "function") {
    throw new Error("Falta configurar el servicio de registro.");
  }

  try {
    // La funcion remota se encargara de verificar quien hace la solicitud.
    const resultado = await servicioRegistro.crearAdministrador(administradorNuevo);

    if (resultado?.ok !== true) {
      throw new Error("La solicitud no fue aceptada.");
    }

    return {
      ok: true,
      correo: administradorNuevo.correo,
      uid: typeof resultado.uid === "string" ? resultado.uid : null
    };
  } catch {
    throw new Error(
      "No se pudo registrar al administrador. Verifica tus permisos o inténtalo más tarde."
    );
  }
}
