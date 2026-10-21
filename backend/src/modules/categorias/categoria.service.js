import mongoose from "mongoose";
import Categoria from "./categoria.model.js";
import Producto from "../productos/producto.model.js";

const crearCategoria = async (datos) => {
  const { nombre, descripcion } = datos;

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const nombreNormalizado = nombre.trim();

  const categoriaExistente = await Categoria.findOne({
    nombre: nombreNormalizado
  });

  if (categoriaExistente) {
    throw new Error("La categoría ya está registrada");
  }

  const categoria = await Categoria.create({
    nombre: nombreNormalizado,
    descripcion: descripcion?.trim() || ""
  });

  return categoria;
};

const obtenerCategorias = async () => {
  return await Categoria.find({
    activo: true
  }).sort({ nombre: 1 });
};

const actualizarCategoria = async (id, datos) => {
  const { nombre, descripcion, activo } = datos;

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const nombreNormalizado = nombre.trim();

  const categoriaExistente = await Categoria.findOne({
    nombre: nombreNormalizado,
    _id: { $ne: id }
  });

  if (categoriaExistente) {
    throw new Error("La categoría ya está registrada");
  }

  const categoria = await Categoria.findByIdAndUpdate(
    id,
    {
      nombre: nombreNormalizado,
      descripcion: descripcion?.trim() || "",
      activo: activo !== undefined ? activo : true
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!categoria) {
    throw new Error("Categoría no encontrada");
  }

  return categoria;
};


const eliminarCategoria = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("El ID de la categoría no es válido");
  }

  const categoria = await Categoria.findById(id);
  if (!categoria) throw new Error("Categoría no encontrada");

  const productosAsociados = await Producto.countDocuments({ categoria: id });
  if (productosAsociados > 0) {
    throw new Error(`No se eliminó la categoría porque tiene ${productosAsociados} producto(s) asociado(s). Entra a Productos, cambia esos productos a otra categoría y vuelve a intentarlo.`);
  }

  await Categoria.findByIdAndDelete(id);
  return { id, mensaje: "Categoría eliminada correctamente" };
};

export default {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria
};