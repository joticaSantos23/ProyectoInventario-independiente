import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuario from "../modules/auth/usuario.model.js";

const crearUsuariosBase = async () => {
  try {
    // =========================
    // CONECTAR A MONGODB
    // =========================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado correctamente.");

    // =========================
    // ELIMINAR USUARIOS ACTUALES
    // =========================

    const resultadoEliminacion = await Usuario.deleteMany({});

    console.log(
      `Usuarios anteriores eliminados: ${resultadoEliminacion.deletedCount}`
    );

    // =========================
    // CONTRASEÑAS
    // =========================

    const passwordAdmin = "Admin123";
    const passwordAprendiz = "Aprendiz123";

    const passwordAdminHash = await bcrypt.hash(passwordAdmin, 10);
    const passwordAprendizHash = await bcrypt.hash(passwordAprendiz, 10);

    // =========================
    // CREAR ADMINISTRADOR
    // =========================

    const admin = await Usuario.create({
      nombre: "Administrador",
      identificacion: "ADMIN001",
      areaPrograma: "Administración de Inventario",
      correo: "admin@inventario.local",
      telefono: "3000000000",
      password: passwordAdminHash,
      rol: "admin",
      activo: true
    });

    // =========================
    // CREAR APRENDIZ
    // =========================

    const aprendiz = await Usuario.create({
      nombre: "Aprendiz de Prueba",
      identificacion: "APR001",
      areaPrograma: "Formación SENA",
      correo: "aprendiz@inventario.local",
      telefono: "3000000001",
      password: passwordAprendizHash,
      rol: "aprendiz",
      activo: true
    });

    // =========================
    // MOSTRAR RESULTADO
    // =========================

    console.log("");
    console.log("========================================");
    console.log("USUARIOS CREADOS CORRECTAMENTE");
    console.log("========================================");

    console.log("");
    console.log("ADMINISTRADOR / INSTRUCTOR");
    console.log("----------------------------------------");
    console.log("Correo:      admin@inventario.local");
    console.log("Contraseña:  Admin123");
    console.log("Rol:         admin");

    console.log("");
    console.log("APRENDIZ");
    console.log("----------------------------------------");
    console.log("Correo:      aprendiz@inventario.local");
    console.log("Contraseña:  Aprendiz123");
    console.log("Rol:         aprendiz");

    console.log("");
    console.log("========================================");
    console.log("Proceso terminado.");
    console.log("========================================");
  } catch (error) {
    console.error("");
    console.error("ERROR AL CREAR LOS USUARIOS:");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Conexión con MongoDB cerrada.");
  }
};

crearUsuariosBase();
