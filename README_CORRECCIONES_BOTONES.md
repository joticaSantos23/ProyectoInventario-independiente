# Correcciones de acciones administrativas

Esta versión corrige el flujo de acciones administrativas del proyecto:

- La validación del token consulta la cuenta actual en MongoDB. Cuando se desactiva un aprendiz, también se bloquean las peticiones de una sesión que ya estaba abierta.
- La activación/desactivación exige un valor booleano explícito y devuelve errores claros si la petición es incorrecta.
- Los botones de eliminar producto, eliminar categoría, borrar historial y gestionar aprendices leen de forma robusta los mensajes de error del servidor.
- El borrado del historial elimina los movimientos y no cambia el stock actual.
- Al eliminar un producto, el backend impide borrarlo si está en préstamos pendientes, aprobados o entregados. Si se puede eliminar, también borra sus movimientos asociados para no dejar entradas huérfanas.
- Una categoría solo se elimina si no tiene productos asociados. Si los tiene, el mensaje indica que primero hay que reasignarlos a otra categoría.

## Pruebas

- Se ejecutó `node --check` sobre todos los archivos JavaScript del backend sin errores de sintaxis.
- No fue posible terminar `npm ci`/`npm run build` del frontend en este entorno por falta de acceso completo al registro de npm. Debe validarse el build local después de instalar las dependencias.

## Para probarlo

1. Reemplaza la carpeta anterior por esta versión o extrae el ZIP en otra carpeta.
2. Conserva tu archivo `backend/.env` actual (no está incluido en el ZIP).
3. Reinicia el backend y el frontend.
4. Cierra sesión y vuelve a entrar como administrador para probar con un token nuevo.
5. Prueba primero con datos de prueba: crear/desactivar aprendiz, borrar historial, eliminar un producto sin préstamos abiertos y eliminar una categoría vacía.
