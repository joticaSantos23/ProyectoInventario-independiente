import mongoose from "mongoose";
import Producto from "../productos/producto.model.js";

const factores = { m: 1, cm: 0.01, mm: 0.001, L: 1, ml: 0.001, kg: 1, g: 0.001, unidad: 1 };
const grupos = { m: "longitud", cm: "longitud", mm: "longitud", L: "volumen", ml: "volumen", kg: "masa", g: "masa", unidad: "unidad" };

const calcularCotizacion = async (productos) => {
  if (!Array.isArray(productos) || productos.length === 0) throw new Error("Debe seleccionar al menos un producto");
  const productosCotizados = [];
  for (const item of productos) {
    const { producto: productoId, cantidad, unidad } = item;
    if (!mongoose.Types.ObjectId.isValid(productoId)) throw new Error(`El ID del producto no es válido: ${productoId}`);
    const producto = await Producto.findById(productoId);
    if (!producto || !producto.activo || producto.estado === "Retirado") throw new Error("El producto no existe o está inactivo");
    const unidadBase = producto.unidadMedida || "unidad";
    const unidadSolicitada = unidad || unidadBase;
    if (grupos[unidadSolicitada] !== grupos[unidadBase]) throw new Error(`La unidad ${unidadSolicitada} no es compatible con ${unidadBase} para ${producto.nombre}`);
    const cantidadBase = Number(cantidad) * (factores[unidadSolicitada] || 1) / (factores[unidadBase] || 1);
    if (!Number.isFinite(cantidadBase) || cantidadBase <= 0) throw new Error("La cantidad debe ser mayor que cero");
    if (cantidadBase > Number(producto.stock || 0)) throw new Error(`La cantidad solicitada de ${producto.nombre} supera el stock disponible`);
    const precioUnitario = Number(producto.stock) > 0 ? Number(producto.precio || 0) / Number(producto.stock) : 0;
    const subtotal = precioUnitario * cantidadBase;
    productosCotizados.push({ producto: producto._id, codigo: producto.codigo, nombre: producto.nombre, unidad: unidadSolicitada, unidadBase, cantidad: Number(cantidad), cantidadBase, precioUnitario, subtotal });
  }
  const total = productosCotizados.reduce((suma, item) => suma + item.subtotal, 0);
  return { productos: productosCotizados, subtotal: total, iva: 0, total };
};

export default { calcularCotizacion };
