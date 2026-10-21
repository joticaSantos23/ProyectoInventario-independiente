<template>
  <div class="prestamos-page">
    <!-- ENCABEZADO -->
    <header class="page-header">
      <div>
        <span class="eyebrow">MIS SOLICITUDES</span>
        <h1>Mis préstamos</h1>
        <p>
          Consulta el estado y los detalles de tus solicitudes de préstamo.
        </p>
      </div>

      <button class="btn-secondary" @click="volverInventario">
        <span class="btn-icon">←</span>
        Volver al inventario
      </button>
    </header>

    <!-- ESTADÍSTICAS -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div>
          <span class="stat-label">Total solicitudes</span>
          <strong>{{ prestamos.length }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">⏳</div>
        <div>
          <span class="stat-label">Pendientes</span>
          <strong>{{ cantidadPorEstado('Pendiente') }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">✓</div>
        <div>
          <span class="stat-label">Aprobados</span>
          <strong>{{ cantidadPorEstado('Aprobado') }}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">📦</div>
        <div>
          <span class="stat-label">Entregados</span>
          <strong>{{ cantidadPorEstado('Entregado') }}</strong>
        </div>
      </div>
    </section>

    <!-- FILTROS -->
    <section class="filters-card">
      <div class="filters-heading">
        <div>
          <h2>Solicitudes</h2>
          <span>
            {{ prestamosFiltrados.length }}
            {{ prestamosFiltrados.length === 1 ? 'solicitud encontrada' : 'solicitudes encontradas' }}
          </span>
        </div>

        <div class="filter-group">
          <label for="filtroEstado">Estado</label>

          <select id="filtroEstado" v-model="filtroEstado">
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Entregado">Entregado</option>
            <option value="Devuelto">Devuelto</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>
    </section>

    <!-- CARGANDO -->
    <div v-if="cargando" class="state-card">
      <div class="spinner"></div>
      <h3>Cargando préstamos...</h3>
      <p>Estamos consultando tus solicitudes.</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="state-card error-state">
      <div class="state-icon">!</div>
      <h3>No fue posible cargar tus préstamos</h3>
      <p>{{ error }}</p>

      <button class="btn-primary" @click="cargarPrestamos">
        Intentar nuevamente
      </button>
    </div>

    <!-- SIN PRÉSTAMOS -->
    <div
      v-else-if="prestamosFiltrados.length === 0"
      class="state-card empty-state"
    >
      <div class="empty-icon">📦</div>

      <h3>
        {{
          prestamos.length === 0
            ? 'Todavía no tienes solicitudes'
            : 'No hay solicitudes con este estado'
        }}
      </h3>

      <p>
        {{
          prestamos.length === 0
            ? 'Cuando realices una solicitud de préstamo aparecerá aquí.'
            : 'Prueba seleccionando otro estado en el filtro.'
        }}
      </p>

      <button
        v-if="prestamos.length === 0"
        class="btn-primary"
        @click="irInventario"
      >
        Explorar inventario
      </button>
    </div>

    <!-- LISTA DE PRÉSTAMOS -->
    <section v-else class="prestamos-list">
      <article
        v-for="prestamo in prestamosFiltrados"
        :key="prestamo._id"
        class="prestamo-card"
      >
        <!-- CABECERA DEL PRÉSTAMO -->
        <div class="prestamo-header">
          <div class="prestamo-title">
            <div class="loan-icon">
              📋
            </div>

            <div>
              <span class="loan-label">SOLICITUD</span>

              <h2>
                #{{ obtenerNumeroPrestamo(prestamo) }}
              </h2>

              <span class="loan-date">
                {{ formatearFecha(prestamo.createdAt || prestamo.fechaSolicitud) }}
              </span>
            </div>
          </div>

          <span
            class="status-badge"
            :class="claseEstado(prestamo.estado)"
          >
            <span class="status-dot"></span>
            {{ prestamo.estado || 'Pendiente' }}
          </span>
        </div>

        <!-- PRODUCTOS -->
        <div class="productos-section">
          <div class="section-title">
            <span>Productos solicitados</span>

            <strong>
              {{ obtenerTotalUnidades(prestamo) }}
              {{
                obtenerTotalUnidades(prestamo) === 1
                  ? 'unidad'
                  : 'unidades'
              }}
            </strong>
          </div>

          <div class="productos-list">
            <div
              v-for="(item, index) in obtenerProductos(prestamo)"
              :key="`${prestamo._id}-${item.producto?._id || item.producto || index}`"
              class="producto-row"
            >
              <div class="producto-image">
                <img
                  v-if="obtenerImagenProducto(item)"
                  :src="obtenerImagenProducto(item)"
                  :alt="obtenerNombreProducto(item)"
                />

                <span v-else>📦</span>
              </div>

              <div class="producto-info">
                <strong>
                  {{ obtenerNombreProducto(item) }}
                </strong>

                <span v-if="obtenerCodigoProducto(item)">
                  Código: {{ obtenerCodigoProducto(item) }}
                </span>
              </div>

              <div class="producto-quantity">
                <span>Cantidad</span>
                <strong>× {{ obtenerCantidad(item) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- INFORMACIÓN -->
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Fecha de devolución</span>
            <strong>
              {{
                formatearFecha(
                  prestamo.fechaDevolucionPrevista ||
                    prestamo.fechaDevolucion
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Lugar de entrega</span>
            <strong>
              {{ prestamo.lugarEntrega || 'No especificado' }}
            </strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Área / programa</span>
            <strong>
              {{ prestamo.areaPrograma || 'No especificado' }}
            </strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Teléfono</span>
            <strong>
              {{ prestamo.telefono || 'No especificado' }}
            </strong>
          </div>
        </div>

        <!-- MOTIVO DE RECHAZO -->
        <div
          v-if="prestamo.estado === 'Rechazado' && prestamo.motivoRechazo"
          class="rejection-box"
        >
          <div class="rejection-icon">!</div>

          <div>
            <strong>Motivo del rechazo</strong>
            <p>{{ prestamo.motivoRechazo }}</p>
          </div>
        </div>

        <!-- OBSERVACIONES -->
        <div
          v-if="prestamo.observaciones"
          class="observations-box"
        >
          <span>Observaciones</span>
          <p>{{ prestamo.observaciones }}</p>
        </div>

        <!-- PIE -->
        <div class="prestamo-footer">
          <div class="footer-summary">
            <span>
              {{ obtenerCantidadProductos(prestamo) }}
              {{
                obtenerCantidadProductos(prestamo) === 1
                  ? 'producto'
                  : 'productos'
              }}
            </span>

            <span class="separator">•</span>

            <strong>
              {{ obtenerTotalUnidades(prestamo) }}
              {{
                obtenerTotalUnidades(prestamo) === 1
                  ? 'unidad'
                  : 'unidades'
              }}
            </strong>
          </div>

          <button
            class="btn-detail"
            @click="verDetalle(prestamo)"
          >
            Ver detalle
            <span>→</span>
          </button>
        </div>
      </article>
    </section>

    <!-- MODAL DETALLE -->
    <div
      v-if="prestamoSeleccionado"
      class="modal-overlay"
      @click.self="cerrarDetalle"
    >
      <div class="detail-modal">
        <div class="modal-header">
          <div>
            <span class="loan-label">DETALLE DE SOLICITUD</span>

            <h2>
              #{{ obtenerNumeroPrestamo(prestamoSeleccionado) }}
            </h2>
          </div>

          <button
            class="close-button"
            @click="cerrarDetalle"
          >
            ×
          </button>
        </div>

        <div class="modal-status">
          <span
            class="status-badge"
            :class="claseEstado(prestamoSeleccionado.estado)"
          >
            <span class="status-dot"></span>
            {{ prestamoSeleccionado.estado || 'Pendiente' }}
          </span>
        </div>

        <div class="modal-products">
          <h3>Productos solicitados</h3>

          <div
            v-for="(item, index) in obtenerProductos(prestamoSeleccionado)"
            :key="`modal-${index}`"
            class="modal-product"
          >
            <div class="modal-product-icon">
              📦
            </div>

            <div>
              <strong>
                {{ obtenerNombreProducto(item) }}
              </strong>

              <span>
                {{ obtenerCodigoProducto(item) || 'Sin código' }}
              </span>
            </div>

            <strong class="modal-quantity">
              × {{ obtenerCantidad(item) }}
            </strong>
          </div>
        </div>

        <div class="modal-summary">
          <div>
            <span>Total de productos</span>
            <strong>
              {{ obtenerCantidadProductos(prestamoSeleccionado) }}
            </strong>
          </div>

          <div>
            <span>Total de unidades</span>
            <strong>
              {{ obtenerTotalUnidades(prestamoSeleccionado) }}
            </strong>
          </div>

          <div>
            <span>Devolución prevista</span>
            <strong>
              {{
                formatearFecha(
                  prestamoSeleccionado.fechaDevolucionPrevista ||
                    prestamoSeleccionado.fechaDevolucion
                )
              }}
            </strong>
          </div>

          <div>
            <span>Lugar de entrega</span>
            <strong>
              {{
                prestamoSeleccionado.lugarEntrega ||
                  'No especificado'
              }}
            </strong>
          </div>
        </div>

        <div
          v-if="prestamoSeleccionado.observaciones"
          class="modal-observations"
        >
          <span>Observaciones</span>
          <p>{{ prestamoSeleccionado.observaciones }}</p>
        </div>

        <div
          v-if="
            prestamoSeleccionado.estado === 'Rechazado' &&
            prestamoSeleccionado.motivoRechazo
          "
          class="modal-rejection"
        >
          <strong>Motivo del rechazo</strong>
          <p>{{ prestamoSeleccionado.motivoRechazo }}</p>
        </div>

        <button
          class="btn-primary modal-close-btn"
          @click="cerrarDetalle"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const prestamos = ref([])
const cargando = ref(true)
const error = ref('')
const filtroEstado = ref('Todos')
const prestamoSeleccionado = ref(null)

const prestamosFiltrados = computed(() => {
  if (filtroEstado.value === 'Todos') {
    return prestamos.value
  }

  return prestamos.value.filter(
    (prestamo) => normalizarEstado(prestamo.estado) === filtroEstado.value,
  )
})

const cantidadPorEstado = (estado) => {
  return prestamos.value.filter(
    (prestamo) => normalizarEstado(prestamo.estado) === estado,
  ).length
}

const normalizarEstado = (estado) => {
  if (!estado) {
    return 'Pendiente'
  }

  const texto = String(estado).trim().toLowerCase()

  const estados = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    entregado: 'Entregado',
    devuelto: 'Devuelto',
    rechazado: 'Rechazado',
  }

  return estados[texto] || estado
}

const cargarPrestamos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await api.obtenerMisPrestamos()

    if (Array.isArray(respuesta)) {
      prestamos.value = respuesta
    } else {
      prestamos.value = []
    }

    prestamos.value.sort((a, b) => {
      const fechaA = new Date(
        a.createdAt || a.fechaSolicitud || 0,
      ).getTime()

      const fechaB = new Date(
        b.createdAt || b.fechaSolicitud || 0,
      ).getTime()

      return fechaB - fechaA
    })
  } catch (err) {
    console.error('Error cargando préstamos:', err)

    error.value =
      err?.message ||
      'No fue posible obtener tus solicitudes de préstamo.'
  } finally {
    cargando.value = false
  }
}

const obtenerNumeroPrestamo = (prestamo) => {
  if (prestamo.codigo) {
    return prestamo.codigo
  }

  if (prestamo.numero) {
    return prestamo.numero
  }

  if (prestamo._id) {
    return String(prestamo._id).slice(-6).toUpperCase()
  }

  return '000000'
}

const obtenerProductos = (prestamo) => {
  if (!prestamo || !Array.isArray(prestamo.productos)) {
    return []
  }

  return prestamo.productos
}

const obtenerCantidadProductos = (prestamo) => {
  return obtenerProductos(prestamo).length
}

const obtenerTotalUnidades = (prestamo) => {
  return obtenerProductos(prestamo).reduce(
    (total, item) => total + obtenerCantidad(item),
    0,
  )
}

const obtenerCantidad = (item) => {
  const cantidad = Number(item?.cantidad)

  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return 0
  }

  return cantidad
}

const obtenerNombreProducto = (item) => {
  if (!item) {
    return 'Producto'
  }

  if (typeof item.producto === 'object' && item.producto !== null) {
    return (
      item.producto.nombre ||
      item.producto.name ||
      item.nombre ||
      'Producto'
    )
  }

  return item.nombre || 'Producto'
}

const obtenerCodigoProducto = (item) => {
  if (!item) {
    return ''
  }

  if (typeof item.producto === 'object' && item.producto !== null) {
    return (
      item.producto.codigo ||
      item.producto.id ||
      item.codigo ||
      ''
    )
  }

  return item.codigo || String(item.producto || '')
}

const obtenerImagenProducto = (item) => {
  if (!item) {
    return ''
  }

  if (typeof item.producto === 'object' && item.producto !== null) {
    return (
      item.producto.imagenUrl ||
      item.producto.imagen ||
      item.imagenUrl ||
      ''
    )
  }

  return item.imagenUrl || ''
}

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'No especificada'
  }

  const fechaObj = new Date(fecha)

  if (Number.isNaN(fechaObj.getTime())) {
    return 'No especificada'
  }

  return fechaObj.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const claseEstado = (estado) => {
  const estadoNormalizado = normalizarEstado(estado)

  return {
    pendiente: estadoNormalizado === 'Pendiente',
    aprobado: estadoNormalizado === 'Aprobado',
    entregado: estadoNormalizado === 'Entregado',
    devuelto: estadoNormalizado === 'Devuelto',
    rechazado: estadoNormalizado === 'Rechazado',
  }
}

const verDetalle = (prestamo) => {
  prestamoSeleccionado.value = prestamo
}

const cerrarDetalle = () => {
  prestamoSeleccionado.value = null
}

const volverInventario = () => {
  router.push({
    name: 'inventario-aprendiz',
  })
}

const irInventario = () => {
  router.push({
    name: 'inventario-aprendiz',
  })
}

onMounted(() => {
  cargarPrestamos()
})
</script>

<style scoped>
.prestamos-page {
  min-height: 100vh;
  padding: 32px;
  background: #f5f7fb;
  color: #172033;
}

/* ==============================
   HEADER
============================== */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #3563e9;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 800;
}

.page-header p {
  margin: 9px 0 0;
  color: #6d778a;
  font-size: 15px;
}

.btn-secondary,
.btn-primary,
.btn-detail {
  border: 0;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s ease;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 17px;
  border: 1px solid #dce2ed;
  border-radius: 10px;
  background: #ffffff;
  color: #263247;
  font-size: 14px;
  font-weight: 700;
}

.btn-secondary:hover {
  background: #f1f4f9;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 18px;
}

/* ==============================
   STATS
============================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid #e4e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 20px rgba(22, 35, 62, 0.04);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  font-size: 21px;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: #eaf0ff;
  color: #3563e9;
}

.stat-icon.orange {
  background: #fff4df;
  color: #db8a00;
}

.stat-icon.green {
  background: #e8f8ef;
  color: #16864a;
}

.stat-icon.purple {
  background: #f0eaff;
  color: #7447d8;
}

.stat-label {
  display: block;
  margin-bottom: 4px;
  color: #7b8495;
  font-size: 12px;
  font-weight: 600;
}

.stat-card strong {
  color: #182236;
  font-size: 24px;
}

/* ==============================
   FILTERS
============================== */

.filters-card {
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #e4e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.filters-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.filters-heading h2 {
  margin: 0;
  color: #1a2437;
  font-size: 18px;
}

.filters-heading span {
  display: block;
  margin-top: 4px;
  color: #7c8595;
  font-size: 13px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: #586378;
  font-size: 13px;
  font-weight: 700;
}

.filter-group select {
  min-width: 170px;
  padding: 10px 13px;
  border: 1px solid #dce2ed;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
  color: #253047;
  font-family: inherit;
  font-size: 14px;
}

.filter-group select:focus {
  border-color: #3563e9;
}

/* ==============================
   STATES
============================== */

.state-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
  border: 1px solid #e4e8f0;
  border-radius: 16px;
  background: #ffffff;
  text-align: center;
}

.state-card h3 {
  margin: 16px 0 6px;
  color: #1c2639;
  font-size: 18px;
}

.state-card p {
  max-width: 500px;
  margin: 0 0 20px;
  color: #7b8495;
  font-size: 14px;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #e4e9f2;
  border-top-color: #3563e9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.state-icon,
.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #edf1f8;
  color: #5e697d;
  font-size: 25px;
  font-weight: 800;
}

.error-state .state-icon {
  background: #ffeded;
  color: #d13b3b;
}

.empty-icon {
  font-size: 28px;
}

/* ==============================
   PRÉSTAMOS
============================== */

.prestamos-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.prestamo-card {
  overflow: hidden;
  border: 1px solid #e2e7ef;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 5px 22px rgba(22, 35, 62, 0.04);
}

.prestamo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 21px 23px;
  border-bottom: 1px solid #edf0f5;
}

.prestamo-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.loan-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #edf2ff;
  font-size: 21px;
}

.loan-label {
  display: block;
  margin-bottom: 3px;
  color: #7d8798;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.prestamo-title h2 {
  margin: 0;
  color: #1c2639;
  font-size: 18px;
}

.loan-date {
  display: block;
  margin-top: 4px;
  color: #8790a0;
  font-size: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.pendiente {
  background: #fff4dd;
  color: #bd7900;
}

.status-badge.aprobado {
  background: #e8f8ef;
  color: #16834a;
}

.status-badge.entregado {
  background: #e9f1ff;
  color: #3563d8;
}

.status-badge.devuelto {
  background: #f0eafa;
  color: #7650c7;
}

.status-badge.rechazado {
  background: #ffeded;
  color: #c73939;
}

/* ==============================
   PRODUCTOS
============================== */

.productos-section {
  padding: 20px 23px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
  color: #29344a;
  font-size: 14px;
  font-weight: 800;
}

.section-title strong {
  color: #3563e9;
  font-size: 13px;
}

.productos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.producto-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #fafbfd;
}

.producto-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 9px;
  background: #edf1f7;
  color: #657187;
  font-size: 21px;
  flex-shrink: 0;
}

.producto-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-info {
  flex: 1;
  min-width: 0;
}

.producto-info strong {
  display: block;
  overflow: hidden;
  color: #273247;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.producto-info span {
  display: block;
  margin-top: 4px;
  color: #7e8797;
  font-size: 11px;
}

.producto-quantity {
  min-width: 75px;
  text-align: right;
}

.producto-quantity span {
  display: block;
  margin-bottom: 3px;
  color: #8a92a1;
  font-size: 10px;
}

.producto-quantity strong {
  color: #253047;
  font-size: 15px;
}

/* ==============================
   DETAILS
============================== */

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 18px 23px;
  border-top: 1px solid #edf0f5;
}

.detail-item {
  min-width: 0;
}

.detail-label {
  display: block;
  margin-bottom: 5px;
  color: #858e9f;
  font-size: 11px;
  font-weight: 700;
}

.detail-item strong {
  display: block;
  overflow: hidden;
  color: #303b50;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==============================
   OBSERVACIONES / RECHAZO
============================== */

.rejection-box,
.observations-box {
  margin: 0 23px 18px;
  padding: 13px 15px;
  border-radius: 10px;
}

.rejection-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff1f1;
  color: #a62e2e;
}

.rejection-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e65b5b;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.rejection-box strong {
  font-size: 12px;
}

.rejection-box p,
.observations-box p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.observations-box {
  background: #f5f7fb;
}

.observations-box span {
  color: #6e788b;
  font-size: 11px;
  font-weight: 800;
}

/* ==============================
   FOOTER
============================== */

.prestamo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 23px;
  border-top: 1px solid #edf0f5;
}

.footer-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #7d8798;
  font-size: 12px;
}

.footer-summary strong {
  color: #2c3850;
}

.separator {
  color: #b3bac5;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 9px;
  background: #edf2ff;
  color: #3563d8;
  font-size: 12px;
  font-weight: 800;
}

.btn-detail:hover {
  background: #dfe8ff;
}

.btn-detail span {
  font-size: 16px;
}

/* ==============================
   BOTÓN PRIMARIO
============================== */

.btn-primary {
  padding: 11px 18px;
  border-radius: 9px;
  background: #3563e9;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.btn-primary:hover {
  background: #2854d2;
  transform: translateY(-1px);
}

/* ==============================
   MODAL
============================== */

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(18, 27, 43, 0.55);
  backdrop-filter: blur(3px);
}

.detail-modal {
  width: min(650px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 17px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 25, 45, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 23px 16px;
  border-bottom: 1px solid #edf0f5;
}

.modal-header h2 {
  margin: 0;
  color: #1b263a;
  font-size: 23px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: #f2f4f8;
  color: #5c6779;
  cursor: pointer;
  font-size: 24px;
}

.close-button:hover {
  background: #e9edf3;
}

.modal-status {
  padding: 16px 23px;
}

.modal-products {
  padding: 0 23px 18px;
}

.modal-products h3 {
  margin: 0 0 11px;
  color: #29344a;
  font-size: 14px;
}

.modal-product {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #edf0f5;
}

.modal-product:last-child {
  border-bottom: 0;
}

.modal-product-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 9px;
  background: #edf1f7;
}

.modal-product > div:nth-child(2) {
  flex: 1;
}

.modal-product strong {
  display: block;
  color: #29344a;
  font-size: 13px;
}

.modal-product span {
  display: block;
  margin-top: 3px;
  color: #8891a1;
  font-size: 11px;
}

.modal-product .modal-quantity {
  color: #3563e9;
  font-size: 15px;
}

.modal-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0 23px 18px;
  padding: 16px;
  border-radius: 11px;
  background: #f7f9fc;
}

.modal-summary div {
  min-width: 0;
}

.modal-summary span {
  display: block;
  margin-bottom: 4px;
  color: #858e9e;
  font-size: 10px;
  font-weight: 700;
}

.modal-summary strong {
  display: block;
  overflow: hidden;
  color: #2b364b;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-observations,
.modal-rejection {
  margin: 0 23px 18px;
  padding: 13px 15px;
  border-radius: 10px;
}

.modal-observations {
  background: #f5f7fb;
}

.modal-observations span,
.modal-rejection strong {
  font-size: 11px;
  font-weight: 800;
}

.modal-observations p,
.modal-rejection p {
  margin: 5px 0 0;
  color: #606b7e;
  font-size: 12px;
  line-height: 1.5;
}

.modal-rejection {
  background: #fff1f1;
  color: #a62e2e;
}

.modal-close-btn {
  width: calc(100% - 46px);
  margin: 0 23px 23px;
}

/* ==============================
   ANIMACIÓN
============================== */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==============================
   RESPONSIVE
============================== */

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .prestamos-page {
    padding: 20px 14px;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-card strong {
    font-size: 20px;
  }

  .filters-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group select {
    width: 100%;
  }

  .prestamo-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .details-grid {
    grid-template-columns: 1fr 1fr;
  }

  .prestamo-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .btn-detail {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .producto-row {
    align-items: flex-start;
  }

  .producto-quantity {
    min-width: auto;
  }

  .modal-summary {
    grid-template-columns: 1fr;
  }
}
</style>