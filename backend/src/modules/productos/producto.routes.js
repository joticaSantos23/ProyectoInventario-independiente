import express from "express";
import productoController from "./producto.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";
import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

// Consultar productos
router.get(
  "/",
  verificarToken,
  productoController.obtenerTodos
);

// Consultar producto por ID
router.get(
  "/:id",
  verificarToken,
  productoController.obtenerPorId
);

// Crear producto - solo administrador
router.post(
  "/",
  verificarToken,
  verificarRol("admin"),
  productoController.crear
);

// Actualizar producto - solo administrador
router.put(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  productoController.actualizar
);

// Eliminar producto - solo administrador
router.delete(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  productoController.eliminar
);

export default router;