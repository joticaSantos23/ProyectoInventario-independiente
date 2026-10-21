import express from "express";
import authController from "./auth.controller.js";
import verificarToken from "../../middlewares/verificarToken.js";
import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

router.post("/registro", authController.registrar);
router.post("/login", authController.login);

// Gestión de cuentas individuales de aprendices: solo administración.
router.get("/aprendices", verificarToken, verificarRol("admin"), authController.obtenerAprendices);
router.post("/aprendices", verificarToken, verificarRol("admin"), authController.crearAprendiz);
router.patch("/aprendices/:id", verificarToken, verificarRol("admin"), authController.cambiarEstadoAprendiz);
router.delete("/aprendices/:id", verificarToken, verificarRol("admin"), authController.eliminarAprendiz);

export default router;
