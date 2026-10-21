import express from "express";
import categoriaController from "./categoria.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";
import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

// Consultar categorías - usuarios autenticados
router.get(
  "/",
  verificarToken,
  categoriaController.obtenerTodas
);

// Crear categoría - solo administrador
router.post(
  "/",
  verificarToken,
  verificarRol("admin"),
  categoriaController.crear
);

// Actualizar categoría - solo administrador
router.put(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  categoriaController.actualizar
);

router.delete(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  categoriaController.eliminar
);

export default router;