# Cambios preparados: dashboard e imágenes

## Cambios incluidos

1. La tarjeta roja `Requieren atención` cuenta cada producto una sola vez si tiene stock cero, estado `Dañado` o estado `Retirado`.
2. El resumen del inventario conserva `Sin stock` y añade las barras `Dañados` y `Retirados`.
3. El panel inferior muestra categorías con cantidad de productos y barras de colores en lugar de los paneles de atención/acciones rápidas.
4. El formulario de productos permite conservar una URL, seleccionar una imagen del equipo o abrir la cámara en dispositivos compatibles. La imagen se optimiza y se guarda en una colección separada de MongoDB; no depende del disco temporal del servidor.

## Imágenes

- Formatos admitidos: JPG, PNG y WEBP.
- El navegador reduce la imagen a un máximo de 1400 px y calidad JPEG 82 antes de enviarla.
- El tamaño máximo guardado es 2 MB por imagen optimizada.
- La colección de imágenes está separada de los documentos de productos para no cargar todos los bytes en cada listado.
- El endpoint de lectura de imágenes es público para que `<img>` pueda cargarlo sin incluir tokens en la URL. Solo administradores autenticados pueden cargar o eliminar imágenes.

## Verificaciones realizadas en este entorno

- `node --check` pasó para los archivos JavaScript del backend modificados.
- `node --check` pasó para `frontend/src/services/api.js` y para los bloques `<script setup>` de las páginas Vue modificadas.
- Se comprobó con datos de ejemplo que un producto que cumple varias condiciones se cuenta una sola vez.
- No se pudo ejecutar `npm run build` aquí: no están disponibles todos los paquetes de npm en la caché y la instalación no pudo completarse sin acceso al registro. Debe ejecutarse en el equipo local con la versión de Node exigida por `frontend/package.json`.

## Antes de publicar

1. En el equipo local: `cd frontend`, `npm ci`, `npm run build`.
2. En otra terminal: `cd backend`, `npm ci`.
3. Probar localmente creación/edición de producto, carga de archivo, cámara en móvil, persistencia de imagen tras recargar y las cuatro partes del dashboard.
4. Revisar `git diff` y confirmar que el remoto sea el repositorio independiente antes de hacer commit/push.
5. Si se cambió backend, confirmar que el servicio independiente de backend también despliegue el commit.
