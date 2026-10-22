
import mongoose from "mongoose";

const itemPrestamoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: [true, "El producto es obligatorio"]
    },

        cantidad: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [0.000001, "La cantidad debe ser mayor que cero"],
    },

   cantidadSolicitada: {
  type: Number,
  min: [1, "La cantidad solicitada debe ser un entero mayor que cero"],
  validate: { validator: (valor) => valor == null || Number.isInteger(valor), message: "La cantidad solicitada debe ser un número entero" },
  default: null
},

unidadSolicitada: {
  type: String,
  trim: true,
  default: ""
}
  },
  {
    _id: false
  }
);

const prestamoSchema = new mongoose.Schema(
  {
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null
    },

    tipoPersona: {
      type: String,
      enum: {
        values: [
          "aprendiz",
          "instructor",
          "funcionario",
          "otro"
        ],
        message: "El tipo de persona no es válido"
      },
      default: "aprendiz"
    },

    nombreSolicitante: {
      type: String,
      required: [true, "El nombre del solicitante es obligatorio"],
      trim: true
    },

    identificacion: {
      type: String,
      required: [true, "La identificación es obligatoria"],
      trim: true
    },

    areaPrograma: {
      type: String,
      required: [true, "El área o programa es obligatorio"],
      trim: true
    },

    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      trim: true,
      lowercase: true
    },

    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true
    },

    fechaSolicitud: {
      type: Date,
      required: [true, "La fecha de solicitud es obligatoria"],
      default: Date.now
    },

    lugarEntrega: {
      type: String,
      required: [true, "El lugar de entrega es obligatorio"],
      trim: true
    },

    productos: {
      type: [itemPrestamoSchema],
      required: [true, "Debe solicitar al menos un producto"],
      validate: {
        validator: function (productos) {
          return Array.isArray(productos) && productos.length > 0;
        },
        message: "Debe solicitar al menos un producto"
      }
    },

    observaciones: {
      type: String,
      trim: true,
      default: ""
    },

    estado: {
      type: String,
      enum: {
        values: [
          "Pendiente",
          "Aprobado",
          "Rechazado",
          "Entregado",
          "Devuelto"
        ],
        message: "El estado del préstamo no es válido"
      },
      default: "Pendiente"
    },

    fechaEntrega: {
      type: Date,
      default: null
    },

    fechaDevolucionReal: {
      type: Date,
      default: null
    },

    aprobadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null
    },

    fechaAprobacion: {
      type: Date,
      default: null
    },

    motivoRechazo: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Prestamo = mongoose.model(
  "Prestamo",
  prestamoSchema
);

export default Prestamo;
