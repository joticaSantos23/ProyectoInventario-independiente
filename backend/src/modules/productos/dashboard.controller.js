import dashboardService from "./dashboard.service.js";

const obtenerResumen = async (req, res) => {
  try {
    const resumen = await dashboardService.obtenerResumenDashboard();

    res.status(200).json({
      mensaje: "Resumen del dashboard obtenido correctamente",
      resumen
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

export default {
  obtenerResumen
};