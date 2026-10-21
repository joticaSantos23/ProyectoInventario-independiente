import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("La variable MONGO_URI no está configurada.");
    }

    const separador = mongoUri.includes("?") ? "&" : "?";
    const uriConfigurada = /[?&]retryWrites=/i.test(mongoUri)
      ? mongoUri.replace(/([?&])retryWrites=[^&]*/i, "$1retryWrites=false")
      : `${mongoUri}${separador}retryWrites=false`;

    const retryWritesConfigurado =
      /[?&]retryWrites=false(?:&|$)/i.test(uriConfigurada);

    console.log("retryWrites desactivado:", retryWritesConfigurado);

    await mongoose.connect(uriConfigurada);

    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

export default conectarDB;