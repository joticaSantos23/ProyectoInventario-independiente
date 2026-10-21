import mongoose from "mongoose";
import Movimiento from "./movimiento.model.js";
import Producto from "../productos/producto.model.js";
import Usuario from "../auth/usuario.model.js";

const registrarMovimiento = async (datos, usuarioId) => {
  const {
    producto: productoId,
    tipo,
    cantidad,
    observacion
  } = datos;

  if (!productoId) {
    throw new Error("El producto es obligatorio");
  }

  if (!mongoose.Types.ObjectId.isValid(productoId)) {
    throw new Error("El ID del producto no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  if (!tipo) {
    throw new Error("El tipo de movimiento es obligatorio");
  }

  const tiposPermitidos = [
    "Entrada",
    "Salida",
    "Devolución",
    "Ajuste"
  ];

  if (!tiposPermitidos.includes(tipo)) {
    throw new Error("El tipo de movimiento no es válido");
  }

  if (
    cantidad === undefined ||
    cantidad === null ||
    cantidad === ""
  ) {
    throw new Error("La cantidad es obligatoria");
  }

  const cantidadNumerica = Number(cantidad);

  if (!Number.isFinite(cantidadNumerica)) {
    throw new Error("La cantidad debe ser un número válido");
  }

  if (cantidadNumerica <= 0) {
    throw new Error("La cantidad debe ser mayor que cero");
  }

  const producto = await Producto.findById(productoId);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario responsable no encontrado");
  }

  let nuevoStock = producto.stock;

  if (tipo === "Entrada" || tipo === "Devolución") {
    nuevoStock += cantidadNumerica;
  }

  if (tipo === "Salida") {
    nuevoStock -= cantidadNumerica;

    if (nuevoStock < 0) {
      throw new Error(
        "No hay suficiente stock disponible para realizar la salida"
      );
    }
  }

  if (tipo === "Ajuste") {
    nuevoStock = cantidadNumerica;
  }

  producto.stock = nuevoStock;

  if (nuevoStock === 0) {
    producto.estado = "Disponible";
  } else if (nuevoStock <= producto.stockMinimo) {
    producto.estado = "Disponible";
  } else {
    producto.estado = "Disponible";
  }

  await producto.save();

  const movimiento = await Movimiento.create({
    producto: productoId,
    tipo,
    cantidad: cantidadNumerica,
    usuarioResponsable: usuarioId,
    observacion: observacion?.trim() || ""
  });

  return await movimiento.populate([
    {
      path: "producto",
      select: "codigo nombre stock stockMinimo estado unidadMedida"
    },
    {
      path: "usuarioResponsable",
      select: "nombre correo rol"
    }
  ]);
};

const obtenerMovimientos = async () => {
  return await Movimiento.find()
    .populate(
      "producto",
      "codigo nombre stock stockMinimo estado unidadMedida"
    )
    .populate(
      "usuarioResponsable",
      "nombre correo rol"
    )
    .sort({ createdAt: -1 });
};

const obtenerMovimientosPorProducto = async (productoId) => {
  if (!mongoose.Types.ObjectId.isValid(productoId)) {
    throw new Error("El ID del producto no es válido");
  }

  return await Movimiento.find({
    producto: productoId
  })
    .populate(
      "producto",
      "codigo nombre stock stockMinimo estado unidadMedida"
    )
    .populate(
      "usuarioResponsable",
      "nombre correo rol"
    )
    .sort({ createdAt: -1 });
};

const eliminarHistorial = async () => {
  const resultado = await Movimiento.deleteMany({});
  return { eliminados: resultado.deletedCount || 0, mensaje: "Historial de movimientos eliminado correctamente" };
};

export default {
  registrarMovimiento,
  obtenerMovimientos,
  obtenerMovimientosPorProducto,
  eliminarHistorial
};