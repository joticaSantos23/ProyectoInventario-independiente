import "dotenv/config";
import app from "./app.js";
import conectarDB from "./config/database.js";

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
};

iniciarServidor();