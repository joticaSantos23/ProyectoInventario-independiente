import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Usuario from "./usuario.model.js";

const registrarUsuario = async (datos) => {
  const { nombre, identificacion, areaPrograma, correo, telefono, password, rol } = datos;
  if (!nombre || !String(nombre).trim()) throw new Error("El nombre es obligatorio");
  if (!correo || !String(correo).trim()) throw new Error("El correo es obligatorio");
  if (!password || String(password).length < 6) throw new Error("La contraseña debe tener mínimo 6 caracteres");

  const correoNormalizado = String(correo).toLowerCase().trim();
  if (await Usuario.findOne({ correo: correoNormalizado })) throw new Error("El correo ya está registrado");
  if (identificacion && await Usuario.findOne({ identificacion: String(identificacion).trim() })) {
    throw new Error("La identificación ya está registrada");
  }

  const passwordEncriptada = await bcrypt.hash(password, 10);
  return Usuario.create({
    nombre: String(nombre).trim(),
    ...(identificacion ? { identificacion: String(identificacion).trim() } : {}),
    areaPrograma: String(areaPrograma || "Aprendiz").trim(),
    correo: correoNormalizado,
    telefono: String(telefono || "").trim(),
    password: passwordEncriptada,
    rol: rol || "aprendiz"
  });
};

const iniciarSesion = async (identificador, password) => {
  const valor = String(identificador || "").toLowerCase().trim();
  const usuario = await Usuario.findOne({ $or: [{ correo: valor }, { usuario: valor }] });
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw new Error("Usuario/correo o contraseña incorrectos");
  }
  if (!usuario.activo) throw new Error("El usuario está inactivo");

  const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      usuario: usuario.usuario || "",
      identificacion: usuario.identificacion || "",
      areaPrograma: usuario.areaPrograma || "",
      correo: usuario.correo || "",
      telefono: usuario.telefono || "",
      rol: usuario.rol,
      activo: usuario.activo
    }
  };
};

const crearAprendiz = async (datos) => {
  const nombre = String(datos.nombre || "").trim();
  const usuarioLogin = String(datos.usuario || "").trim().toLowerCase();
  const password = String(datos.password || "");
  if (!nombre) throw new Error("El nombre del aprendiz es obligatorio");
  if (!/^[a-z0-9._-]{3,30}$/.test(usuarioLogin)) {
    throw new Error("El usuario debe tener entre 3 y 30 caracteres y usar letras, números, punto, guion o guion bajo");
  }
  if (password.length < 6) throw new Error("La contraseña debe tener mínimo 6 caracteres");
  if (await Usuario.findOne({ usuario: usuarioLogin })) throw new Error("Ese nombre de usuario ya está registrado");

  const correoInterno = `${usuarioLogin}@aprendiz.local`;
  if (await Usuario.findOne({ correo: correoInterno })) throw new Error("No se pudo crear la cuenta por un conflicto de datos");
  const passwordEncriptada = await bcrypt.hash(password, 10);
  const aprendiz = await Usuario.create({
    nombre,
    usuario: usuarioLogin,
    areaPrograma: String(datos.areaPrograma || "Aprendiz").trim(),
    correo: correoInterno,
    telefono: "",
    password: passwordEncriptada,
    rol: "aprendiz",
    activo: true
  });
  const resultado = aprendiz.toObject();
  delete resultado.password;
  return resultado;
};

const obtenerAprendices = async () => Usuario.find({ rol: "aprendiz", eliminado: { $ne: true } }).select("-password").sort({ nombre: 1 });

const cambiarEstadoAprendiz = async (id, activo) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("El ID del aprendiz no es válido");
  if (typeof activo !== "boolean") throw new Error("Debes indicar si la cuenta queda activa o inactiva");
  const aprendiz = await Usuario.findOneAndUpdate(
    { _id: id, rol: "aprendiz" },
    { activo },
    { new: true, runValidators: true }
  ).select("-password");
  if (!aprendiz) throw new Error("Aprendiz no encontrado");
  return aprendiz;
};

const eliminarAprendiz = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("El ID del aprendiz no es válido");
  const aprendiz = await Usuario.findOneAndUpdate(
    { _id: id, rol: "aprendiz", eliminado: { $ne: true } },
    { activo: false, eliminado: true },
    { new: true, runValidators: true }
  ).select("-password");
  if (!aprendiz) throw new Error("Aprendiz no encontrado o ya eliminado");
  // Borrado lógico: se conservan los préstamos y movimientos asociados para no perder el historial.
  return { id: String(aprendiz._id), mensaje: "Cuenta de aprendiz eliminada correctamente" };
};

export default {
  registrarUsuario,
  iniciarSesion,
  crearAprendiz,
  obtenerAprendices,
  cambiarEstadoAprendiz,
  eliminarAprendiz
};
