import express from "express";

import prestamoController from "./prestamo.controller.js";

import verificarToken from "../../middlewares/verificarToken.js";

import verificarRol from "../../middlewares/verificarRol.js";

const router = express.Router();

// ============================================================================
// CREAR SOLICITUD DE PRÉSTAMO
// Solo aprendiz
// ============================================================================

router.post(
  "/",
  verificarToken,
  verificarRol("aprendiz"),
  prestamoController.crear
);

// ============================================================================
// APROBAR PRÉSTAMO
// Solo administrador
// ============================================================================

router.put(
  "/:id/aprobar",
  verificarToken,
  verificarRol("admin"),
  prestamoController.aprobar
);

// ============================================================================
// RECHAZAR PRÉSTAMO
// Solo administrador
// ============================================================================

router.put(
  "/:id/rechazar",
  verificarToken,
  verificarRol("admin"),
  prestamoController.rechazar
);

// ============================================================================
// REGISTRAR ENTREGA
// Solo administrador
// ============================================================================

router.put(
  "/:id/entregar",
  verificarToken,
  verificarRol("admin"),
  prestamoController.entregar
);

// ============================================================================
// REGISTRAR DEVOLUCIÓN
// Solo administrador
// ============================================================================

router.put(
  "/:id/devolver",
  verificarToken,
  verificarRol("admin"),
  prestamoController.devolver
);

// ============================================================================
// ELIMINAR PRÉSTAMO
// Solo administrador
//
// El servicio se encarga de verificar que el préstamo esté en estado
// "Rechazado" o "Devuelto" antes de permitir eliminarlo.
// ============================================================================

router.delete(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  prestamoController.eliminar
);

// ============================================================================
// CONSULTAR TODOS LOS PRÉSTAMOS
// Solo administrador
// ============================================================================

router.get(
  "/",
  verificarToken,
  verificarRol("admin"),
  prestamoController.obtenerTodos
);

// ============================================================================
// CONSULTAR MIS PRÉSTAMOS
// Solo aprendiz
// ============================================================================

router.get(
  "/mis-prestamos",
  verificarToken,
  verificarRol("aprendiz"),
  prestamoController.obtenerMisPrestamos
);

// ============================================================================
// CONSULTAR PRÉSTAMO POR ID
// Usuario autenticado
// ============================================================================

router.get(
  "/:id",
  verificarToken,
  prestamoController.obtenerPorId
);



 // ============================================================================
 // CREAR PRÉSTAMO DIRECTAMENTE DESDE ADMINISTRACIÓN
 // Solo administrador
 // ============================================================================

router.post(
  "/administrador",
  verificarToken,
  verificarRol("admin"),
  prestamoController.crearAdministrativo
);


export default router;