import cotizadorService from "./cotizador.service.js";

const calcular = async (req, res) => {
  try {
    const { productos } = req.body;
    const cotizacion = await cotizadorService.calcularCotizacion(productos);
    res.status(200).json({ mensaje: "Cotización calculada correctamente", cotizacion });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

export default { calcular };
