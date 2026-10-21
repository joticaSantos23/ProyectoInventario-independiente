import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import productoRoutes from "./modules/productos/producto.routes.js";
import categoriaRoutes from "./modules/categorias/categoria.routes.js";
import movimientoRoutes from "./modules/movimientos/movimiento.routes.js";
import prestamoRoutes from "./modules/prestamos/prestamo.routes.js";
import cotizadorRoutes from "./modules/cotizador/cotizador.routes.js";
import dashboardRoutes from "./modules/productos/dashboard.routes.js";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de productos
app.use("/api/productos", productoRoutes);

// Rutas de categorías
app.use("/api/categorias", categoriaRoutes);

// Rutas de movimientos
app.use("/api/movimientos", movimientoRoutes);

app.use("/api/prestamos", prestamoRoutes);

app.use("/api/cotizador", cotizadorRoutes);

app.use("/api/dashboard", dashboardRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Proyecto Inventario funcionando correctamente"
  });
});

export default app;