import mongoose from "mongoose";

const movimientoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: [true, "El producto es obligatorio"]
    },

    tipo: {
      type: String,
      enum: {
        values: [
          "Entrada",
          "Salida",
          "Devolución",
          "Ajuste"
        ],
        message: "El tipo de movimiento no es válido"
      },
      required: [true, "El tipo de movimiento es obligatorio"]
    },

    cantidad: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [0.000001, "La cantidad debe ser mayor que cero"]
    },

    usuarioResponsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El usuario responsable es obligatorio"]
    },

    observacion: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Movimiento = mongoose.model(
  "Movimiento",
  movimientoSchema
);

export default Movimiento;