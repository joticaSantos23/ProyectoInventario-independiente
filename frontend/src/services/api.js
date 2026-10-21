const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const resolverUrlImagen = (url) => {
  if (!url) return ''
  if (/^(data:|https?:\/\/|blob:)/i.test(url)) return url
  const base = API_URL.replace(/\/$/, '')
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}
const obtenerToken = () => {
  return sessionStorage.getItem('token')
}

const obtenerHeaders = () => {
  const token = obtenerToken()

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Lee respuestas incluso cuando el servidor devuelve HTML o un cuerpo vacío.
// Evita que las acciones de eliminar/desactivar fallen con un error JSON confuso.
const leerRespuesta = async (respuesta) => {
  const texto = await respuesta.text()
  if (!texto) return {}
  try { return JSON.parse(texto) } catch {
    return { mensaje: texto.slice(0, 250) || `Error HTTP ${respuesta.status}` }
  }
}

// ==============================
// DASHBOARD
// ==============================

const obtenerDashboard = async () => {
  const respuesta = await fetch(`${API_URL}/dashboard`, {
    method: 'GET',
    headers: obtenerHeaders(),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener el dashboard.',
    )
  }

  return datos.resumen
}

// ==============================
// PRODUCTOS
// ==============================

const obtenerProductos = async (filtros = {}) => {
  const parametros = new URLSearchParams()

  if (filtros.buscar) {
    parametros.append('buscar', filtros.buscar)
  }

  if (filtros.categoria) {
    parametros.append('categoria', filtros.categoria)
  }

  if (filtros.estado) {
    parametros.append('estado', filtros.estado)
  }

  const queryString = parametros.toString()

  const respuesta = await fetch(
    `${API_URL}/productos${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener los productos.',
    )
  }

  return datos.productos
}

const obtenerProductoPorId = async (id) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: 'GET',
    headers: obtenerHeaders(),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener el producto.',
    )
  }

  return datos.producto
}

const crearProducto = async (producto) => {
  const respuesta = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(producto),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible crear el producto.',
    )
  }

  return datos.producto
}

const subirImagenProducto = async (id, imagen) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}/imagen`, {
    method: 'PUT',
    headers: obtenerHeaders(),
    body: JSON.stringify({ imagen }),
  })

  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No fue posible guardar la imagen.')
  }
  return datos
}

const eliminarImagenProducto = async (id) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}/imagen`, {
    method: 'DELETE',
    headers: obtenerHeaders(),
  })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No fue posible eliminar la imagen.')
  }
  return datos
}

const actualizarProducto = async (id, producto) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: 'PUT',
    headers: obtenerHeaders(),
    body: JSON.stringify(producto),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible actualizar el producto.',
    )
  }

  return datos.producto
}

const eliminarProducto = async (id) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: obtenerHeaders(),
  })

  const datos = await leerRespuesta(respuesta)

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || `No fue posible eliminar el producto (HTTP ${respuesta.status}).`)
  }

  return datos
}

// ==============================
// CATEGORÍAS
// ==============================

const obtenerCategorias = async () => {
  const respuesta = await fetch(`${API_URL}/categorias`, {
    method: 'GET',
    headers: obtenerHeaders(),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener las categorías.',
    )
  }

  return datos.categorias
}

const crearCategoria = async (categoria) => {
  const respuesta = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(categoria),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible crear la categoría.',
    )
  }

  return datos.categoria
}

const actualizarCategoria = async (id, categoria) => {
  const respuesta = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: obtenerHeaders(),
    body: JSON.stringify(categoria),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible actualizar la categoría.',
    )
  }

  return datos.categoria
}

// ==============================
// MOVIMIENTOS
// ==============================

const obtenerMovimientos = async () => {
  const respuesta = await fetch(`${API_URL}/movimientos`, {
    method: 'GET',
    headers: obtenerHeaders(),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener los movimientos.',
    )
  }

  return datos.movimientos
}

const obtenerMovimientosPorProducto = async (productoId) => {
  const respuesta = await fetch(
    `${API_URL}/movimientos/producto/${productoId}`,
    {
      method: 'GET',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        'No fue posible obtener los movimientos del producto.',
    )
  }

  return datos.movimientos
}

const registrarMovimiento = async (movimiento) => {
  const respuesta = await fetch(`${API_URL}/movimientos`, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(movimiento),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible registrar el movimiento.',
    )
  }

  return datos.movimiento
}

// ==============================
// PRÉSTAMOS
// ==============================

// Crear solicitud de préstamo
// APRENDIZ

const crearPrestamo = async (prestamo) => {
  const respuesta = await fetch(`${API_URL}/prestamos`, {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(prestamo),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        'No fue posible crear la solicitud de préstamo.',
    )
  }

  return datos.prestamo
}



 // ==============================
 // CREAR PRÉSTAMO ADMINISTRATIVO
 // ADMINISTRADOR
 // ==============================

const crearPrestamoAdministrativo = async (prestamo) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/administrador`,
    {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify(prestamo),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        'No fue posible registrar el préstamo administrativo.',
    )
  }

  return datos.prestamo
}



// ==============================
// TODOS LOS PRÉSTAMOS
// ADMINISTRADOR
// ==============================

const obtenerPrestamos = async () => {
  const respuesta = await fetch(`${API_URL}/prestamos`, {
    method: 'GET',
    headers: obtenerHeaders(),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener los préstamos.',
    )
  }

  return datos.prestamos
}

// ==============================
// MIS PRÉSTAMOS
// APRENDIZ
// ==============================

const obtenerMisPrestamos = async () => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/mis-prestamos`,
    {
      method: 'GET',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener tus préstamos.',
    )
  }

  return datos.prestamos
}

// ==============================
// PRÉSTAMO POR ID
// ==============================

const obtenerPrestamoPorId = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}`,
    {
      method: 'GET',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible obtener el préstamo.',
    )
  }

  return datos.prestamo
}

// ==============================
// APROBAR PRÉSTAMO
// ADMINISTRADOR
// ==============================

const aprobarPrestamo = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}/aprobar`,
    {
      method: 'PUT',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible aprobar el préstamo.',
    )
  }

  return datos.prestamo
}

// ==============================
// RECHAZAR PRÉSTAMO
// ADMINISTRADOR
// ==============================

const rechazarPrestamo = async (id, motivoRechazo) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}/rechazar`,
    {
      method: 'PUT',
      headers: obtenerHeaders(),
      body: JSON.stringify({
        motivoRechazo,
      }),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible rechazar el préstamo.',
    )
  }

  return datos.prestamo
}

// ==============================
// ENTREGAR PRÉSTAMO
// ADMINISTRADOR
// ==============================

const entregarPrestamo = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}/entregar`,
    {
      method: 'PUT',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible registrar la entrega.',
    )
  }

  return datos.prestamo
}

// ==============================
// DEVOLVER PRÉSTAMO
// ADMINISTRADOR
// ==============================

const devolverPrestamo = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}/devolver`,
    {
      method: 'PUT',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        'No fue posible registrar la devolución.',
    )
  }

  return datos.prestamo
}

// ==============================
// ELIMINAR PRÉSTAMO
// ADMINISTRADOR
// ==============================

const eliminarPrestamo = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/prestamos/${id}`,
    {
      method: 'DELETE',
      headers: obtenerHeaders(),
    },
  )

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No fue posible eliminar el préstamo.',
    )
  }

  return datos
}

// ==============================
// EXPORTACIONES
// ==============================


const eliminarCategoria = async (id) => {
  const respuesta = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE', headers: obtenerHeaders() })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible eliminar la categoría (HTTP ${respuesta.status}).`)
  return datos
}

const eliminarHistorialMovimientos = async () => {
  const respuesta = await fetch(`${API_URL}/movimientos/historial`, { method: 'DELETE', headers: obtenerHeaders() })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible borrar el historial (HTTP ${respuesta.status}).`)
  return datos
}

const obtenerAprendices = async () => {
  const respuesta = await fetch(`${API_URL}/auth/aprendices`, { method: 'GET', headers: obtenerHeaders() })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible obtener las cuentas (HTTP ${respuesta.status}).`)
  return datos.aprendices || []
}

const crearAprendiz = async (aprendiz) => {
  const respuesta = await fetch(`${API_URL}/auth/aprendices`, { method: 'POST', headers: obtenerHeaders(), body: JSON.stringify(aprendiz) })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible crear la cuenta (HTTP ${respuesta.status}).`)
  return datos.aprendiz
}

const cambiarEstadoAprendiz = async (id, activo) => {
  const respuesta = await fetch(`${API_URL}/auth/aprendices/${id}`, { method: 'PATCH', headers: obtenerHeaders(), body: JSON.stringify({ activo }) })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible actualizar la cuenta (HTTP ${respuesta.status}).`)
  return datos.aprendiz
}

const eliminarAprendiz = async (id) => {
  const respuesta = await fetch(`${API_URL}/auth/aprendices/${id}`, { method: 'DELETE', headers: obtenerHeaders() })
  const datos = await leerRespuesta(respuesta)
  if (!respuesta.ok) throw new Error(datos.mensaje || `No fue posible eliminar la cuenta (HTTP ${respuesta.status}).`)
  return datos
}

export default {
  // Dashboard
  obtenerDashboard,

  // Productos
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  subirImagenProducto,
  eliminarImagenProducto,
  eliminarProducto,

  // Categorías
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,

  // Movimientos
  obtenerMovimientos,
  obtenerMovimientosPorProducto,
  registrarMovimiento,
  eliminarHistorialMovimientos,

  // Préstamos
  crearPrestamo,
  obtenerPrestamos,
  crearPrestamoAdministrativo,
  obtenerMisPrestamos,
  obtenerPrestamoPorId,
  aprobarPrestamo,
  rechazarPrestamo,
  entregarPrestamo,
  devolverPrestamo,
  eliminarPrestamo,

  // Cuentas de aprendices
  obtenerAprendices,
  crearAprendiz,
  cambiarEstadoAprendiz,
  eliminarAprendiz,
}