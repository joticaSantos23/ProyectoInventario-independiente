import express from "express";
import cotizadorController from "./cotizador.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";

const router = express.Router();

// Calcular cotización - usuario autenticado
router.post(
  "/",
  verificarToken,
  cotizadorController.calcular
);

export default router;