import { convertirABase } from "./src/utils/conversionUnidades.js";

const cable = {
  nombre: "Cable de red",
  unidadMedida: "m",
  unidadPresentacion: "rollo",
  cantidadPorPresentacion: 100
};

console.log("250 cm =", convertirABase(250, "cm", cable), "m");
console.log("2 km =", convertirABase(2, "km", cable), "m");
console.log("1 rollo =", convertirABase(1, "rollo", cable), "m");

try {
  convertirABase(2, "kg", cable);
} catch (error) {
  console.log("Conversión incompatible detectada:", error.message);
}