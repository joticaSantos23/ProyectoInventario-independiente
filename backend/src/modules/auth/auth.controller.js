import authService from "./auth.service.js";

const registrar = async (req, res) => {
  try {
    const usuario = await authService.registrarUsuario(req.body);
    const usuarioRespuesta = usuario.toObject();
    delete usuarioRespuesta.password;
    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: usuarioRespuesta });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

const login = async (req, res) => {
  try {
    const identificador = req.body.usuario || req.body.correo || req.body.identificador;
    const { password } = req.body;
    if (!identificador || !password) return res.status(400).json({ mensaje: "El usuario/correo y la contraseña son obligatorios" });
    const resultado = await authService.iniciarSesion(identificador, password);
    res.status(200).json({ mensaje: "Inicio de sesión exitoso", ...resultado });
  } catch (error) {
    res.status(401).json({ mensaje: error.message });
  }
};

const crearAprendiz = async (req, res) => {
  try {
    const aprendiz = await authService.crearAprendiz(req.body);
    res.status(201).json({ mensaje: "Cuenta de aprendiz creada correctamente", aprendiz });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

const obtenerAprendices = async (_req, res) => {
  try {
    const aprendices = await authService.obtenerAprendices();
    res.status(200).json({ aprendices });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const cambiarEstadoAprendiz = async (req, res) => {
  try {
    const aprendiz = await authService.cambiarEstadoAprendiz(req.params.id, req.body.activo);
    res.status(200).json({ mensaje: "Estado del aprendiz actualizado", aprendiz });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

const eliminarAprendiz = async (req, res) => {
  try {
    const resultado = await authService.eliminarAprendiz(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

export default { registrar, login, crearAprendiz, obtenerAprendices, cambiarEstadoAprendiz, eliminarAprendiz };
