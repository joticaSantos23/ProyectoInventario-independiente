import Producto from "./producto.model.js";

const obtenerResumenDashboard = async () => {
  const productos = await Producto.find();

  const totalProductos = productos.length;

  const productosDisponibles = productos.filter(
    (producto) => producto.estado === "Disponible"
  ).length;

  const productosPrestados = productos.filter(
    (producto) => producto.estado === "Prestado"
  ).length;

  const productosStockBajo = productos.filter(
    (producto) =>
      producto.stock > 0 &&
      producto.stock <= producto.stockMinimo
  ).length;

  const productosSinStock = productos.filter(
    (producto) => producto.stock === 0
  ).length;

  const productosDanados = productos.filter(
    (producto) => producto.estado === "Dañado"
  ).length;

  const productosRetirados = productos.filter(
    (producto) => producto.estado === "Retirado"
  ).length;

  const productosRequierenAtencion = productos.filter(
    (producto) =>
      producto.stock === 0 ||
      producto.estado === "Dañado" ||
      producto.estado === "Retirado"
  ).length;

  return {
    totalProductos,
    productosDisponibles,
    productosPrestados,
    productosStockBajo,
    productosSinStock,
    productosDanados,
    productosRetirados,
    productosRequierenAtencion
  };
};

export default {
  obtenerResumenDashboard
};
