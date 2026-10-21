import mongoose from "mongoose";

const productoImagenSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
      unique: true,
      index: true
    },
    contenido: {
      type: Buffer,
      required: true
    },
    tipoContenido: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProductoImagen", productoImagenSchema);
