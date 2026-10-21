import categoriaService from "./categoria.service.js";

const crear = async (req, res) => {
  try {
    const categoria = await categoriaService.crearCategoria(req.body);

    res.status(201).json({
      mensaje: "Categoría creada correctamente",
      categoria
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const obtenerTodas = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias();

    res.status(200).json({
      categorias
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const categoria = await categoriaService.actualizarCategoria(
      req.params.id,
      req.body
    );

    res.status(200).json({
      mensaje: "Categoría actualizada correctamente",
      categoria
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const resultado = await categoriaService.eliminarCategoria(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

export default {
  crear,
  obtenerTodas,
  actualizar,
  eliminar
};