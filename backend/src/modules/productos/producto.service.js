import mongoose from "mongoose";
import Producto from "./producto.model.js";
import Movimiento from "../movimientos/movimiento.model.js";
import Prestamo from "../prestamos/prestamo.model.js";

const crearProducto = async (datos) => {
  const {
    codigo,
    nombre,
    descripcion,
    categoria,
    marca,
    modelo,
    precio,
    stock,
    stockMinimo,
    estado,
    imagenUrl,
    unidadMedida,
    unidadPresentacion,
    cantidadPorPresentacion
  } = datos;

  if (!codigo || !codigo.trim()) {
    throw new Error("El código es obligatorio");
  }

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (precio === undefined || precio === null || precio === "") {
    throw new Error("El precio es obligatorio");
  }

  if (stock === undefined || stock === null || stock === "") {
    throw new Error("El stock es obligatorio");
  }

  if (stockMinimo === undefined || stockMinimo === null || stockMinimo === "") {
    throw new Error("El stock mínimo es obligatorio");
  }

  if (!categoria) {
    throw new Error("La categoría es obligatoria");
  }

  if (!mongoose.Types.ObjectId.isValid(categoria)) {
    throw new Error("La categoría seleccionada no es válida");
  }

  if (Number(precio) < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  if (Number(stock) < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  if (Number(stockMinimo) < 0) {
    throw new Error("El stock mínimo no puede ser negativo");
  }

  const codigoExistente = await Producto.findOne({
    codigo: codigo.trim().toUpperCase()
  });

  if (codigoExistente) {
    throw new Error("El código del producto ya está registrado");
  }

  const producto = await Producto.create({
    codigo: codigo.trim().toUpperCase(),
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || "",
    categoria,
    marca: marca?.trim() || "",
    modelo: modelo?.trim() || "",
    precio: Number(precio),
    stock: Number(stock),
    stockMinimo: Number(stockMinimo),
    estado: estado || "Disponible",
    imagenUrl: imagenUrl?.trim() || "",
    unidadMedida: unidadMedida || "unidad",
    unidadPresentacion: unidadPresentacion?.trim() || "unidad",
    cantidadPorPresentacion: Number(cantidadPorPresentacion || 1)
  });

  return producto;
};

const obtenerProductos = async (filtros = {}) => {
  const { buscar, categoria, estado } = filtros;

  const condiciones = {};

  if (buscar && buscar.trim()) {
    condiciones.$or = [
      {
        codigo: {
          $regex: buscar.trim(),
          $options: "i"
        }
      },
      {
        nombre: {
          $regex: buscar.trim(),
          $options: "i"
        }
      }
    ];
  }

  if (categoria) {
    if (!mongoose.Types.ObjectId.isValid(categoria)) {
      throw new Error("La categoría seleccionada no es válida");
    }

    condiciones.categoria = categoria;
  }

  if (estado) {
    condiciones.estado = estado;
  }

  return await Producto.find(condiciones)
    .populate("categoria", "nombre")
    .sort({ createdAt: -1 });
};

const obtenerProductoPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("El ID del producto no es válido");
  }

  const producto = await Producto.findById(id)
    .populate("categoria", "nombre");

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  return producto;
};

const actualizarProducto = async (id, datos) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("El ID del producto no es válido");
  }

  const producto = await Producto.findById(id);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  if (datos.codigo !== undefined) {
    if (!datos.codigo.trim()) {
      throw new Error("El código es obligatorio");
    }

    const codigoNormalizado = datos.codigo.trim().toUpperCase();

    const codigoExistente = await Producto.findOne({
      codigo: codigoNormalizado,
      _id: { $ne: id }
    });

    if (codigoExistente) {
      throw new Error("El código del producto ya está registrado");
    }

    datos.codigo = codigoNormalizado;
  }

  if (datos.nombre !== undefined && !datos.nombre.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (datos.precio !== undefined && Number(datos.precio) < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  if (datos.stock !== undefined && Number(datos.stock) < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  if (datos.stockMinimo !== undefined && Number(datos.stockMinimo) < 0) {
    throw new Error("El stock mínimo no puede ser negativo");
  }

  if (datos.cantidadPorPresentacion !== undefined && (!Number.isFinite(Number(datos.cantidadPorPresentacion)) || Number(datos.cantidadPorPresentacion) <= 0)) {
    throw new Error("La equivalencia por presentación debe ser mayor que cero");
  }

  if (datos.categoria !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(datos.categoria)) {
      throw new Error("La categoría seleccionada no es válida");
    }
  }

  const camposPermitidos = [
    "codigo",
    "nombre",
    "descripcion",
    "categoria",
    "marca",
    "modelo",
    "precio",
    "stock",
    "stockMinimo",
    "estado",
    "imagenUrl",
    "unidadMedida",
    "unidadPresentacion",
    "cantidadPorPresentacion",
    "activo"
  ];

  const datosActualizados = {};

  for (const campo of camposPermitidos) {
    if (datos[campo] !== undefined) {
      datosActualizados[campo] = datos[campo];
    }
  }

  const productoActualizado = await Producto.findByIdAndUpdate(
    id,
    datosActualizados,
    {
      new: true,
      runValidators: true
    }
  ).populate("categoria", "nombre");

  return productoActualizado;
};

const eliminarProducto = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("El ID del producto no es válido");
  }

  const producto = await Producto.findById(id);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  // Evita borrar un producto que todavía está prestado o en proceso de entrega.
  const prestamosAbiertos = await Prestamo.countDocuments({
    "productos.producto": id,
    estado: { $in: ["Pendiente", "Aprobado", "Entregado"] }
  });
  if (prestamosAbiertos > 0) {
    throw new Error(`No se puede eliminar: el producto aparece en ${prestamosAbiertos} préstamo(s) pendiente(s), aprobado(s) o entregado(s). Cierra esos préstamos primero.`);
  }

  // Si el producto ya no está en préstamos abiertos, elimina también sus
  // movimientos para no dejar registros huérfanos en el historial.
  const movimientosEliminados = await Movimiento.deleteMany({ producto: id });
  await Producto.findByIdAndDelete(id);

  return {
    mensaje: "Producto eliminado correctamente",
    movimientosEliminados: movimientosEliminados.deletedCount || 0
  };
};

export default {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};