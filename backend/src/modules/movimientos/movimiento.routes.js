import express from "express";
import movimientoController from "./movimiento.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";
import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

// Borrar todo el historial - solo administrador
router.delete(
  "/historial",
  verificarToken,
  verificarRol("admin"),
  movimientoController.eliminarHistorial
);

// Consultar todos los movimientos - solo administrador
router.get(
  "/",
  verificarToken,
  verificarRol("admin"),
  movimientoController.obtenerTodos
);

// Consultar movimientos de un producto - solo administrador
router.get(
  "/producto/:productoId",
  verificarToken,
  verificarRol("admin"),
  movimientoController.obtenerPorProducto
);

// Registrar movimiento - solo administrador
router.post(
  "/",
  verificarToken,
  verificarRol("admin"),
  movimientoController.registrar
);

export default router;