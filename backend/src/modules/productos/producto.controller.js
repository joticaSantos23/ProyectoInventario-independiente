import productoService from "./producto.service.js";

const crear = async (req, res) => {
  try {
    const producto = await productoService.crearProducto(req.body);

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const obtenerTodos = async (req, res) => {
  try {
    const productos = await productoService.obtenerProductos(
      req.query
    );

    res.status(200).json({
      productos
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const producto = await productoService.obtenerProductoPorId(
      req.params.id
    );

    res.status(200).json({
      producto
    });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await productoService.actualizarProducto(
      req.params.id,
      req.body
    );

    res.status(200).json({
      mensaje: "Producto actualizado correctamente",
      producto
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const resultado = await productoService.eliminarProducto(
      req.params.id
    );

    res.status(200).json(resultado);
  } catch (error) {
    res.status(404).json({
      mensaje: error.message
    });
  }
};

export default {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar
};