import movimientoService from "./movimiento.service.js";

const registrar = async (req, res) => {
  try {
    const movimiento = await movimientoService.registrarMovimiento(
      req.body,
      req.usuario.id
    );

    res.status(201).json({
      mensaje: "Movimiento registrado correctamente",
      movimiento
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const obtenerTodos = async (req, res) => {
  try {
    const movimientos = await movimientoService.obtenerMovimientos();

    res.status(200).json({
      movimientos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

const obtenerPorProducto = async (req, res) => {
  try {
    const movimientos =
      await movimientoService.obtenerMovimientosPorProducto(
        req.params.productoId
      );

    res.status(200).json({
      movimientos
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const eliminarHistorial = async (req, res) => {
  try {
    const resultado = await movimientoService.eliminarHistorial();
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default {
  registrar,
  obtenerTodos,
  obtenerPorProducto,
  eliminarHistorial
};