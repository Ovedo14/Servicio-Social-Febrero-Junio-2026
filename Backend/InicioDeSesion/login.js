/**
 * TEC MED | Inicio de sesion de administradores
 * Autora del modulo: Jimena Olvera
 *
 * No necesita Firebase para validar datos o ejecutar pruebas con simuladores.
 * La conexion real se entregara despues mediante `servicioAuth`.
 *
 * Contrato de servicioAuth:
 *   iniciarSesion(correo, contrasena) -> Promise<{ uid: string, email?: string }>
 *   verificarAdministrador(usuario) -> Promise<boolean>
 *   cerrarSesion() -> Promise<void>
 *
 * IMPORTANTE: verificarAdministrador solo controla la interfaz. El backend
 * y las reglas de acceso a expedientes DEBEN comprobar el rol por su cuenta.
 */

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarLogin(datos = {}) {
  const correo = typeof datos?.correo === "string" ? datos.correo.trim() : "";
  const contrasena = datos?.contrasena;

  if (!correo || typeof contrasena !== "string" || contrasena.length === 0) {
    throw new Error("Debes ingresar correo y contraseña.");
  }

  if (correo.length > 254 || !FORMATO_CORREO.test(correo)) {
    throw new Error("Ingresa un correo electrónico válido.");
  }

  // No recortar espacios de la contraseña: pueden formar parte de ella.
  return { correo, contrasena };
}

export async function iniciarSesion(datos, servicioAuth) {
  const { correo, contrasena } = validarLogin(datos);

  if (
    typeof servicioAuth?.iniciarSesion !== "function" ||
    typeof servicioAuth?.verificarAdministrador !== "function" ||
    typeof servicioAuth?.cerrarSesion !== "function"
  ) {
    throw new Error("Falta configurar el servicio de autenticación.");
  }

  let sesionAbierta = false;
  let accesoDenegado = false;

  try {
    const usuario = await servicioAuth.iniciarSesion(correo, contrasena);
    sesionAbierta = true;

    if (!usuario || typeof usuario.uid !== "string" || !usuario.uid) {
      throw new Error("Respuesta de autenticación inválida.");
    }

    const esAdmin = await servicioAuth.verificarAdministrador(usuario);
    if (esAdmin !== true) {
      accesoDenegado = true;
      throw new Error("Acceso no autorizado.");
    }

    return {
      uid: usuario.uid,
      correo: typeof usuario.email === "string" ? usuario.email : correo
    };
  } catch (error) {
    // Si inicio sesion, cerrarla ante cualquier fallo de validacion del rol.
    if (sesionAbierta) {
      try {
        await servicioAuth.cerrarSesion();
      } catch {
        // El servidor debe seguir rechazando el acceso aunque falle el logout.
      }
    }

    if (accesoDenegado) {
      throw new Error("No tienes permisos de administrador.");
    }

    // Mensaje general: no filtrar detalles internos ni revelar si existe la cuenta.
    throw new Error("No se pudo iniciar sesión. Verifica tus datos o inténtalo de nuevo.");
  }
}

export async function cerrarSesion(servicioAuth) {
  if (typeof servicioAuth?.cerrarSesion !== "function") {
    throw new Error("Falta configurar el servicio de autenticación.");
  }

  await servicioAuth.cerrarSesion();
}
