
const grupos = {
  longitud: {
    km: 1000,
    hm: 100,
    dam: 10,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
    um: 0.000001,
    mi: 1609.344
  },
  masa: {
    t: 1000,
    kg: 1,
    hg: 0.1,
    dag: 0.01,
    g: 0.001,
    dg: 0.0001,
    cg: 0.00001,
    mg: 0.000001
  },
  volumen: {
    kL: 1000,
    hL: 100,
    daL: 10,
    L: 1,
    dL: 0.1,
    cL: 0.01,
    mL: 0.001,
    ml: 0.001
  },
  unidad: {
    unidad: 1
  }
};

const grupoDe = (unidad) =>
  Object.keys(grupos).find((grupo) =>
    Object.hasOwn(grupos[grupo], unidad)
  );

export const convertirABase = (
  cantidad,
  unidadSolicitada,
  producto
) => {
  const valor = Number(cantidad);
  const base = producto.unidadMedida || "unidad";
  const solicitada = unidadSolicitada || base;

  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error("La cantidad debe ser mayor que cero");
  }

  if (solicitada === base) {
    return valor;
  }

  // Equivalencia de presentaciones configuradas en el producto.
  if (
    solicitada === producto.unidadPresentacion &&
    Number(producto.cantidadPorPresentacion) > 0
  ) {
    return valor * Number(producto.cantidadPorPresentacion);
  }

  const grupoBase = grupoDe(base);
  const grupoSolicitado = grupoDe(solicitada);

  if (
    !grupoBase ||
    grupoBase !== grupoSolicitado
  ) {
    throw new Error(
      `No se puede convertir ${solicitada} a ${base} para ${producto.nombre}`
    );
  }

  return (
    valor *
    grupos[grupoBase][solicitada] /
    grupos[grupoBase][base]
  );
};
