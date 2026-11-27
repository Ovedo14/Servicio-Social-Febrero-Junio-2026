
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { app } from "../firebase/firebase.js";

// Obtener el servicio de autenticación
const auth = getAuth(app);

export const servicioAuthFirebase = {

  // Autenticar correo y contraseña
  async iniciarSesion(correo, contrasena) {
    const resultado = await signInWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );

    return resultado.user;
  },

  // Verificar si el usuario es administrador
  async verificarAdministrador(usuario) {
    const token = await usuario.getIdTokenResult(true);

    return token.claims.admin === true;
  },

  // Cerrar la sesión actual
  async cerrarSesion() {
    await signOut(auth);
  }
};
