
import prestamoService from "./prestamo.service.js";

// ============================================================================
// CREAR SOLICITUD DE PRÃ‰STAMO â€” APRENDIZ
// ============================================================================

const crear = async (req, res) => {
  try {
    const prestamo = await prestamoService.crearPrestamo(
      req.body,
      req.usuario.id
    );

    res.status(201).json({
      mensaje: "Solicitud de prÃ©stamo creada correctamente",
      prestamo
    });
  
  } catch (error) {
    console.error(
      "ERROR COMPLETO AL CREAR PRÃ‰STAMO ADMINISTRATIVO:",
      error
    );

    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// CREAR PRÃ‰STAMO Y REGISTRAR ENTREGA â€” ADMINISTRADOR
// ============================================================================

const crearAdministrativo = async (req, res) => {
  console.log(">>> ENTRÃ“ A crearAdministrativo <<<");

  try {
    const prestamo =
      await prestamoService.crearPrestamoAdministrativo(
        req.body,
        req.usuario.id
      );

    res.status(201).json({
      mensaje: "PrÃ©stamo registrado y entregado correctamente",
      prestamo
    });
  } catch (error) {
    console.error(
      "ERROR COMPLETO AL CREAR PRÃ‰STAMO ADMINISTRATIVO:",
      error
    );

    res.status(400).json({
      mensaje: error.message
    });
  }
};


// ============================================================================
// OBTENER TODOS LOS PRÃ‰STAMOS
// ============================================================================

const obtenerTodos = async (req, res) => {
  try {
    const prestamos = await prestamoService.obtenerPrestamos();

    res.status(200).json({ prestamos });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// OBTENER MIS PRÃ‰STAMOS
// ============================================================================

const obtenerMisPrestamos = async (req, res) => {
  try {
    const prestamos =
      await prestamoService.obtenerPrestamosPorUsuario(
        req.usuario.id
      );

    res.status(200).json({ prestamos });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// OBTENER PRÃ‰STAMO POR ID
// ============================================================================

const obtenerPorId = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.obtenerPrestamoPorId(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({ prestamo });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// APROBAR PRÃ‰STAMO
// ============================================================================

const aprobar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.aprobarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "PrÃ©stamo aprobado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// RECHAZAR PRÃ‰STAMO
// ============================================================================

const rechazar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.rechazarPrestamo(
        req.params.id,
        req.usuario.id,
        req.body.motivoRechazo
      );

    res.status(200).json({
      mensaje: "PrÃ©stamo rechazado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// ENTREGAR PRÃ‰STAMO
// ============================================================================

const entregar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.entregarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "PrÃ©stamo entregado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// DEVOLVER PRÃ‰STAMO
// ============================================================================

const devolver = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.devolverPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "PrÃ©stamo devuelto correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// ELIMINAR PRÃ‰STAMO
// ============================================================================

const eliminar = async (req, res) => {
  try {
    const resultado =
      await prestamoService.eliminarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "PrÃ©stamo eliminado correctamente",
      prestamo: resultado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// EXPORTAR CONTROLADOR
// ============================================================================

export default {
  crear,
  crearAdministrativo,
  obtenerTodos,
  obtenerMisPrestamos,
  obtenerPorId,
  aprobar,
  rechazar,
  entregar,
  devolver,
  eliminar
};

