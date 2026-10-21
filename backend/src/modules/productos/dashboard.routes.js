import express from "express";
import dashboardController from "./dashboard.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";
import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

// Consultar resumen del dashboard - solo administrador
router.get(
  "/",
  verificarToken,
  verificarRol("admin"),
  dashboardController.obtenerResumen
);

export default router;