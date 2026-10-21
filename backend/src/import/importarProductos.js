import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import "dotenv/config";

import conectarDB from "../config/database.js";
import Producto from "../modules/productos/producto.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archivoExcel = path.join(
  __dirname,
  "../../../../Inventario_Lab.xlsx"
);

const categoriaTecnologiaId = "6ab047fa63e24fc5cb88c765";

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const limpiarTexto = (valor) => {
  if (valor === undefined || valor === null) {
    return "";
  }

  return String(valor)
    .replace(/\u00A0/g, " ")
    .trim();
};

const convertirNumero = (valor) => {
  if (valor === undefined || valor === null || valor === "") {
    return 0;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
};

const convertirFechaExcel = (valor) => {
  if (!valor) {
    return null;
  }

  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === "number") {
    const fecha = xlsx.SSF.parse_date_code(valor);

    if (!fecha) {
      return null;
    }

    return new Date(
      Date.UTC(
        fecha.y,
        fecha.m - 1,
        fecha.d
      )
    );
  }

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const extraerAtributos = (texto) => {
  const resultado = {
    marca: "",
    serial: "",
    modelo: "",
    observaciones: ""
  };

  if (!texto) {
    return resultado;
  }

  const partes = String(texto).split(";");

  for (const parte of partes) {
    const separador = parte.indexOf(":");

    if (separador === -1) {
      continue;
    }

    const clave = parte
      .substring(0, separador)
      .trim()
      .toUpperCase();

    const valor = parte
      .substring(separador + 1)
      .trim();

    if (clave === "MARCA") {
      resultado.marca = valor;
    }

    if (clave === "SERIAL") {
      resultado.serial = valor;
    }

    if (clave === "MODELO") {
      resultado.modelo = valor;
    }

    if (clave === "OBSERVACIONES") {
      resultado.observaciones = valor;
    }
  }

  return resultado;
};

// ==========================================
// LECTURA DEL EXCEL
// ==========================================

console.log("==========================================");
console.log("   IMPORTADOR DE INVENTARIO");
console.log("==========================================");

console.log("\n📄 Archivo Excel:");
console.log(archivoExcel);

const libro = xlsx.readFile(archivoExcel);

console.log("\n📚 Hojas encontradas:");

libro.SheetNames.forEach((nombreHoja, index) => {
  console.log(`   ${index + 1}. ${nombreHoja}`);
});

const nombreHoja = libro.SheetNames[0];
const hoja = libro.Sheets[nombreHoja];

const filas = xlsx.utils.sheet_to_json(hoja, {
  defval: ""
});

console.log("\n==========================================");
console.log("   PRIMERAS FILAS ORIGINALES DEL EXCEL");
console.log("==========================================");

console.log(
  JSON.stringify(filas.slice(0, 5), null, 2)
);

console.log(`\n📊 Registros encontrados: ${filas.length}`);

// ==========================================
// VALIDACIÓN DE ESTRUCTURA
// ==========================================

console.log("\n==========================================");
console.log("   VALIDACIÓN DE ESTRUCTURA");
console.log("==========================================");

const columnasNecesarias = [
  "Centro",
  "Modelo",
  "Consec.",
  "Desc.",
  "Descripción Actual",
  "Tipo",
  "Mod.",
  "Placa",
  "Atributos",
  "Fecha Adquisición",
  "Valor Ingreso"
];

const columnasExcel = Object.keys(filas[0] || {});

const columnasFaltantes = columnasNecesarias.filter(
  (columna) => !columnasExcel.includes(columna)
);

if (columnasFaltantes.length > 0) {
  throw new Error(
    `Faltan columnas necesarias: ${columnasFaltantes.join(", ")}`
  );
}

console.log("✅ Todas las columnas necesarias están presentes.");

// ==========================================
// VALIDACIÓN DE PLACAS
// ==========================================

console.log("\n==========================================");
console.log("   VALIDACIÓN DE PLACAS");
console.log("==========================================");

const placas = filas
  .map((fila) => limpiarTexto(fila["Placa"]))
  .filter(Boolean);

const placasUnicas = new Set(placas);

console.log(`Total de placas: ${placas.length}`);
console.log(`Placas únicas: ${placasUnicas.size}`);
console.log(
  `Placas duplicadas: ${placas.length - placasUnicas.size}`
);

if (placas.length !== placasUnicas.size) {
  throw new Error(
    "Existen placas duplicadas en el archivo Excel."
  );
}

console.log("✅ Todas las placas son únicas.");

// ==========================================
// TRANSFORMACIÓN
// ==========================================

console.log("\n==========================================");
console.log("   TRANSFORMACIÓN DE PRODUCTOS");
console.log("==========================================");

const productos = filas.map((fila, index) => {
  const placa = limpiarTexto(fila["Placa"]);
  const atributos = extraerAtributos(fila["Atributos"]);

  const precio = convertirNumero(
    fila["Valor Ingreso"]
  );

  const fechaAdquisicion = convertirFechaExcel(
    fila["Fecha Adquisición"]
  );

  const producto = {
    codigo: placa.toUpperCase(),

    placa,

    nombre: limpiarTexto(fila["Desc."]),

    descripcion: limpiarTexto(
      fila["Descripción Actual"]
    ),

    categoria: new mongoose.Types.ObjectId(
      categoriaTecnologiaId
    ),

    marca: atributos.marca,

    modelo:
      atributos.modelo ||
      limpiarTexto(fila["Modelo"]),

    serial: atributos.serial,

    precio,

    stock: 1,

    stockMinimo: 0,

    estado: "Disponible",

    imagenUrl: "",

    fechaAdquisicion,

    centro: limpiarTexto(
      fila["Centro"]
    ),

    consecutivo: limpiarTexto(
      fila["Consec."]
    ),

    tipoInventario: limpiarTexto(
      fila["Tipo"]
    ),

    modalidadInventario: limpiarTexto(
      fila["Mod."]
    ),

    atributos: limpiarTexto(
      fila["Atributos"]
    ),

    activo: true
  };

  if (!producto.codigo) {
    throw new Error(
      `La fila ${index + 2} no tiene placa/código.`
    );
  }

  if (!producto.nombre) {
    throw new Error(
      `La fila ${index + 2} no tiene nombre.`
    );
  }

  if (producto.precio < 0) {
    throw new Error(
      `La fila ${index + 2} tiene un precio negativo.`
    );
  }

  if (!producto.serial) {
    throw new Error(
      `La fila ${index + 2} no tiene serial.`
    );
  }

  return producto;
});

console.log(
  `✅ Productos transformados: ${productos.length}`
);

// ==========================================
// MOSTRAR PRIMEROS PRODUCTOS
// ==========================================

console.log("\n🔎 PRIMEROS 5 PRODUCTOS TRANSFORMADOS:");

productos.slice(0, 5).forEach((producto, index) => {
  console.log(
    `\n---------- PRODUCTO ${index + 1} ----------`
  );

  console.log(
    JSON.stringify(
      producto,
      null,
      2
    )
  );
});

// ==========================================
// CONEXIÓN A MONGODB
// ==========================================

console.log("\n==========================================");
console.log("   CONEXIÓN A MONGODB");
console.log("==========================================");

try {
  await conectarDB();

  console.log("✅ Conexión a MongoDB establecida.");

  // ==========================================
  // DETECTAR PRODUCTOS EXISTENTES
  // ==========================================

  console.log("\n==========================================");
  console.log("   VERIFICACIÓN DE PRODUCTOS EXISTENTES");
  console.log("==========================================");

  const codigos = productos.map(
    (producto) => producto.codigo
  );

  const productosExistentes = await Producto.find({
    codigo: {
      $in: codigos
    }
  })
    .select("codigo placa")
    .lean();

  const codigosExistentes = new Set(
    productosExistentes.map(
      (producto) => producto.codigo
    )
  );

  console.log(
    `Productos encontrados previamente: ${productosExistentes.length}`
  );

  const productosNuevos = productos.filter(
    (producto) =>
      !codigosExistentes.has(producto.codigo)
  );

  const productosOmitidos = productos.filter(
    (producto) =>
      codigosExistentes.has(producto.codigo)
  );

  console.log(
    `Productos nuevos para insertar: ${productosNuevos.length}`
  );

  console.log(
    `Productos que serán omitidos: ${productosOmitidos.length}`
  );

  // ==========================================
  // INSERTAR PRODUCTOS NUEVOS
  // ==========================================

  console.log("\n==========================================");
  console.log("   INSERCIÓN EN MONGODB");
  console.log("==========================================");

  if (productosNuevos.length === 0) {
    console.log(
      "ℹ️ No hay productos nuevos para insertar."
    );
  } else {
    const resultado = await Producto.insertMany(
      productosNuevos,
      {
        ordered: false
      }
    );

    console.log(
      `✅ Productos insertados correctamente: ${resultado.length}`
    );
  }

  // ==========================================
  // RESUMEN FINAL
  // ==========================================

  console.log("\n==========================================");
  console.log("   RESUMEN FINAL");
  console.log("==========================================");

  console.log(
    `📊 Total procesados desde Excel: ${productos.length}`
  );

  console.log(
    `🆕 Productos insertados: ${productosNuevos.length}`
  );

  console.log(
    `⏭️ Productos omitidos por existir: ${productosOmitidos.length}`
  );

  const totalProductosDB = await Producto.countDocuments();

  console.log(
    `📦 Total de productos actualmente en MongoDB: ${totalProductosDB}`
  );

  console.log("\n==========================================");
  console.log("   IMPORTACIÓN FINALIZADA");
  console.log("==========================================");

} catch (error) {
  console.error("\n❌ ERROR DURANTE LA IMPORTACIÓN:");

  console.error(error.message);

  if (error.errors) {
    console.error("\nDetalles de validación:");

    for (const [campo, detalle] of Object.entries(
      error.errors
    )) {
      console.error(
        `- ${campo}: ${detalle.message}`
      );
    }
  }

  process.exitCode = 1;

} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();

    console.log(
      "\n🔌 Conexión a MongoDB cerrada."
    );
  }
}