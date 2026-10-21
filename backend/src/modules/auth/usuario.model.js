import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },

    identificacion: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined
    },

    usuario: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },

    areaPrograma: {
      type: String,
      trim: true,
      default: "Aprendiz"
    },

    correo: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },

    telefono: {
      type: String,
      trim: true,
      default: ""
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"]
    },

    rol: {
      type: String,
      enum: {
        values: ["admin", "aprendiz"],
        message: "El rol debe ser admin o aprendiz"
      },
      default: "aprendiz"
    },

    activo: {
      type: Boolean,
      default: true
    },

    // Marca de borrado lógico para conservar referencias de préstamos y movimientos históricos.
    eliminado: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;