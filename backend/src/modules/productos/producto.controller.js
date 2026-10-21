import productoService from "./producto.service.js";
import mongoose from "mongoose";
import Producto from "./producto.model.js";
import ProductoImagen from "./producto-imagen.model.js";

const obtenerImagen = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "El ID del producto no es válido" });
    }

    const imagen = await ProductoImagen.findOne({ producto: req.params.id }).lean();
    if (!imagen) {
      return res.status(404).json({ mensaje: "El producto no tiene una imagen cargada" });
    }

    res.set("Content-Type", imagen.tipoContenido);
    res.set("Cache-Control", "public, max-age=300");
    const contenido = Buffer.isBuffer(imagen.contenido)
      ? imagen.contenido
      : Buffer.from(imagen.contenido?.buffer || imagen.contenido);
    return res.status(200).send(contenido);
  } catch (error) {
    return res.status(500).json({ mensaje: "No fue posible obtener la imagen" });
  }
};

const guardarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "El ID del producto no es válido" });
    }

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const coincidencia = typeof req.body?.imagen === "string"
      ? req.body.imagen.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
      : null;
    if (!coincidencia) {
      return res.status(400).json({ mensaje: "Selecciona una imagen JPG, PNG o WEBP válida" });
    }

    const tipoContenido = coincidencia[1];
    const contenido = Buffer.from(coincidencia[2], "base64");
    const tamanoMaximo = 2 * 1024 * 1024;
    if (!contenido.length || contenido.length > tamanoMaximo) {
      return res.status(413).json({ mensaje: "La imagen debe pesar como máximo 2 MB después de optimizarse" });
    }

    await ProductoImagen.findOneAndUpdate(
      { producto: producto._id },
      { $set: { contenido, tipoContenido } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    producto.imagenUrl = `/productos/${producto._id}/imagen`;
    await producto.save();

    return res.status(200).json({
      mensaje: "Imagen guardada de forma persistente",
      imagenUrl: producto.imagenUrl
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message || "No fue posible guardar la imagen" });
  }
};

const eliminarImagen = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "El ID del producto no es válido" });
    }

    await ProductoImagen.deleteOne({ producto: id });
    const producto = await Producto.findById(id);
    if (producto && String(producto.imagenUrl || "").startsWith("/productos/")) {
      producto.imagenUrl = "";
      await producto.save();
    }

    return res.status(200).json({ mensaje: "Imagen eliminada correctamente" });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message || "No fue posible eliminar la imagen" });
  }
};

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
  obtenerImagen,
  guardarImagen,
  eliminarImagen,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar
};