# Actualización del cotizador

## Cambios
- El cotizador permite cantidades decimales y selección entre unidades compatibles (m/cm/mm, L/ml, kg/g).
- Al cambiar la unidad, la cantidad se convierte manteniendo la misma cantidad física.
- El precio unitario cotizado se calcula como `precio registrado / stock disponible`, según la regla solicitada. Ejemplo: $3.000.000 / 30.000 m = $100/m; cotizar 200 m suma $20.000.
- No se calcula ni se muestra IVA.
- El botón Generar PDF abre el diálogo de impresión del navegador; elige “Guardar como PDF”.
- Cotizar no crea préstamos ni descuenta existencias.

## Nota sobre los datos
Esta regla supone que el campo `precio` del producto representa el valor total del stock registrado actualmente. Si `precio` en tus registros ya representa un valor unitario, habría que adaptar la fórmula o cambiar cómo se guardan los precios.


Actualización adicional: el cotizador descarga directamente un archivo PDF (no abre la ventana de impresión), permite abrir la información de cada producto, incluye unidades métricas adicionales y el portal del aprendiz se centra únicamente en el cotizador. Se retiró del formulario de producto la sección visual “Datos del inventario”; los datos existentes se conservan en la base de datos.


## Cambios de esta versión

- El botón **Descargar PDF** genera y descarga directamente `cotizacion-materiales-AAAA-MM-DD.pdf`; no abre el diálogo de impresión.
- En cada producto está disponible **Ver información del producto**, que abre un panel con sus datos.
- Unidades de medida ampliadas: longitud (km, hm, dam, m, dm, cm, mm, µm y millas), volumen (kL, hL, daL, L, dL, cL, mL) y masa (t, kg, hg, dag, g, dg, cg, mg), además de unidades individuales.
- El portal del aprendiz muestra únicamente el cotizador; la página inicial redirige al cotizador y las antiguas rutas de inventario/préstamos redirigen allí también.
- Se retiró por completo de la interfaz de alta/edición la sección **Datos del inventario**. Los datos históricos guardados en MongoDB se conservan; al editar un producto, la pantalla ya no los sobrescribe con valores vacíos.
- Las cotizaciones son solo informativas: no crean préstamos ni descuentan stock. Los precios se prorratean según el valor del stock y la cantidad disponible, sin IVA.

## Nota de compatibilidad

El backend acepta las nuevas unidades en `unidadMedida`. Para convertir una cantidad, se compara la unidad elegida con la unidad base configurada en el producto; por ejemplo, si la unidad base es km, la cotización convierte los metros a kilómetros antes de validar stock y calcular el precio.
