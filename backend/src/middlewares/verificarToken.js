import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Usuario from "../modules/auth/usuario.model.js";

// Valida el JWT y comprueba el estado actual de la cuenta en MongoDB.
// Así, desactivar un aprendiz revoca su acceso también en sesiones abiertas.
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ mensaje: "Token de autenticación requerido" });
    }

    const partes = authHeader.split(" ");
    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({ mensaje: "Formato de token inválido" });
    }

    const decoded = jwt.verify(partes[1], process.env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ mensaje: "Token inválido" });
    }

    const usuario = await Usuario.findById(decoded.id).select("rol activo");
    if (!usuario) {
      return res.status(401).json({ mensaje: "La cuenta asociada a esta sesión ya no existe" });
    }
    if (usuario.activo === false) {
      return res.status(403).json({ mensaje: "Tu cuenta está desactivada. Contacta al administrador." });
    }

    // El rol vigente se obtiene de la base de datos, no de un JWT antiguo.
    req.usuario = { id: String(usuario._id), rol: usuario.rol };
    return next();
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "La sesión expiró o el token no es válido. Inicia sesión nuevamente." });
    }
    return res.status(500).json({ mensaje: "No fue posible validar la sesión" });
  }
};

export default verificarToken;
