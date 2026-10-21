# ProyectoInventario — cambios integrados

## Cambios incluidos

- **Préstamos administrativos:** el administrador puede registrar una entrega a aprendices, instructores, funcionarios u otras personas, con formulario de datos y varios productos.
- **Categorías:** el administrador puede eliminar una categoría; el backend bloquea la eliminación si todavía tiene productos asociados.
- **Movimientos:** se agregó la opción de borrar todo el historial, con confirmación. Esto elimina registros del historial, pero no cambia las existencias actuales.
- **Cuentas de aprendices:** nueva pestaña administrativa para crear cuentas con nombre, usuario y contraseña. Las contraseñas se almacenan con hash bcrypt. El administrador puede activar/desactivar cuentas.
- **Sesiones individuales:** los préstamos de cada aprendiz se consultan usando el ID del usuario autenticado; las cuentas no comparten sus solicitudes.
- **Unidades de inventario:** cada producto permite configurar la unidad base (unidad, m, cm, mm, L, ml, kg o g), una presentación (por ejemplo, carrete) y su equivalencia. El stock, los préstamos y los movimientos aceptan cantidades decimales y se expresan en la unidad base. Por ejemplo, para un carrete de 100 m se registra stock 100, unidad base `m`, presentación `carrete` y equivalencia 100. Al prestar 3 m, el stock queda en 97 m.

## Configuración

1. Instala Node.js compatible con la versión declarada en `frontend/package.json`.
2. En `backend/`, copia `.env.example` como `.env` y configura tu `MONGO_URI` y un `JWT_SECRET` propio. No se incluye el `.env` original para no distribuir credenciales.
3. Instala dependencias en ambas carpetas:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Inicia el backend con `npm run dev` dentro de `backend/`.
5. Inicia el frontend con `npm run dev` dentro de `frontend/`.

La URL del backend del frontend se configura mediante `VITE_API_URL` si no se usa el valor predeterminado `http://localhost:3000/api`.

## Inicio de sesión

- Las cuentas antiguas pueden seguir ingresando con su correo y contraseña.
- Las cuentas creadas desde **Admin → Aprendices** ingresan con su nombre de usuario y contraseña.
- Las cuentas nuevas usan un correo interno generado por el sistema para mantener compatibilidad con el modelo anterior; el usuario debe iniciar sesión con el nombre de usuario, no con ese correo interno.

## Notas importantes

- La eliminación del historial es permanente y no afecta el stock. Exporta o respalda los movimientos antes de borrarlos si necesitas conservarlos.
- No cambies la unidad base de un producto que ya tenga stock y movimientos sin revisar primero los valores existentes: el stock numérico representa cantidades en la unidad base.
- Las operaciones de préstamo administrativo usan transacciones de MongoDB; el servidor MongoDB debe soportar transacciones (por ejemplo, MongoDB Atlas o un replica set).
