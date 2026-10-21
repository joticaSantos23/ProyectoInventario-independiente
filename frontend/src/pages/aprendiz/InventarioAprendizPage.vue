<template>

  <div class="inventario-page">

    <!-- ========================= -->
    <!-- ENCABEZADO -->
    <!-- ========================= -->

    <section class="page-header">

      <div>

        <span class="eyebrow">INVENTARIO</span>

        <h1>Inventario disponible</h1>

        <p>
          Consulta los equipos y productos disponibles
          para solicitar un préstamo.
        </p>

      </div>

      <div class="header-actions">

        <!-- CARRITO / PRÉSTAMO -->

        <button
          v-if="carritoPrestamo.length > 0"
          type="button"
          class="loan-cart-button"
          @click="irSolicitudPrestamo"
        >

          <span class="material-icons">shopping_cart</span>

          <span>
            Préstamo
            <strong>
              ({{ carritoPrestamo.length }})
            </strong>
          </span>

          <span class="cart-total">

            {{
              carritoPrestamo.reduce(
                (total, item) =>
                  total + Number(item.cantidad),
                0,
              )
            }}

          </span>

        </button>

        <!-- ACTUALIZAR -->

        <button
          class="refresh-button"
          type="button"
          :disabled="cargando"
          @click="cargarDatos"
        >

          <span class="material-icons">refresh</span>

          Actualizar

        </button>

      </div>

    </section>


    <!-- ========================= -->
    <!-- FILTROS -->
    <!-- ========================= -->

    <section class="filters-card">

      <div class="filter-group search-group">

        <label for="busqueda">Buscar</label>

        <div class="input-with-icon">

          <span class="material-icons">search</span>

          <input
            id="busqueda"
            v-model="busqueda"
            type="text"
            placeholder="Código o nombre del producto..."
          />

        </div>

      </div>


      <div class="filter-group">

        <label for="categoria">Categoría</label>

        <select
          id="categoria"
          v-model="categoriaSeleccionada"
        >

          <option value="">
            Todas las categorías
          </option>

          <option
            v-for="categoria in categorias"
            :key="categoria._id"
            :value="categoria._id"
          >
            {{ categoria.nombre }}
          </option>

        </select>

      </div>


      <div class="filter-group">

        <label for="estado">Estado</label>

        <select
          id="estado"
          v-model="estadoSeleccionado"
        >

          <option value="">
            Todos los estados
          </option>

          <option value="Disponible">
            Disponible
          </option>

          <option value="Prestado">
            Prestado
          </option>

          <option value="Mantenimiento">
            Mantenimiento
          </option>

          <option value="Dañado">
            Dañado
          </option>

          <option value="Retirado">
            Retirado
          </option>

        </select>

      </div>

    </section>


    <!-- ========================= -->
    <!-- RESUMEN -->
    <!-- ========================= -->

    <section class="summary-grid">

      <div class="summary-card">

        <div class="summary-icon blue">

          <span class="material-icons">
            inventory_2
          </span>

        </div>

        <div>

          <span class="summary-label">
            Productos
          </span>

          <strong>
            {{ productos.length }}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon green">

          <span class="material-icons">
            check_circle
          </span>

        </div>

        <div>

          <span class="summary-label">
            Disponibles
          </span>

          <strong>
            {{ productosDisponibles }}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon orange">

          <span class="material-icons">
            warning
          </span>

        </div>

        <div>

          <span class="summary-label">
            Sin stock
          </span>

          <strong>
            {{ productosSinStock }}
          </strong>

        </div>

      </div>

    </section>


    <!-- ========================= -->
    <!-- CARGANDO -->
    <!-- ========================= -->

    <div
      v-if="cargando"
      class="state-container"
    >

      <span class="material-icons loading-icon">
        sync
      </span>

      <h3>Cargando inventario...</h3>

      <p>
        Estamos consultando los productos disponibles.
      </p>

    </div>


    <!-- ========================= -->
    <!-- ERROR -->
    <!-- ========================= -->

    <div
      v-else-if="error"
      class="state-container error-state"
    >

      <span class="material-icons">
        error_outline
      </span>

      <h3>No fue posible cargar el inventario</h3>

      <p>
        {{ error }}
      </p>

      <button
        type="button"
        class="primary-button"
        @click="cargarDatos"
      >
        Intentar nuevamente
      </button>

    </div>


    <!-- ========================= -->
    <!-- SIN RESULTADOS -->
    <!-- ========================= -->

    <div
      v-else-if="productosFiltrados.length === 0"
      class="state-container"
    >

      <span class="material-icons">
        search_off
      </span>

      <h3>No se encontraron productos</h3>

      <p>
        Intenta cambiar los filtros o la búsqueda.
      </p>

    </div>


    <!-- ========================= -->
    <!-- PRODUCTOS -->
    <!-- ========================= -->

    <section
      v-else
      class="products-grid"
    >

      <article
        v-for="producto in productosFiltrados"
        :key="producto._id"
        class="product-card"
      >

        <!-- IMAGEN -->

        <div class="product-image-container">

          <img
            v-if="producto.imagenUrl"
            :src="producto.imagenUrl"
            :alt="producto.nombre"
            class="product-image"
          />

          <div
            v-else
            class="product-image-placeholder"
          >

            <span class="material-icons">
              inventory_2
            </span>

          </div>


          <!-- ESTADO -->

          <span
            class="status-badge"
            :class="estadoClase(producto)"
          >
            {{ obtenerEstado(producto) }}
          </span>

        </div>


        <!-- INFORMACIÓN -->

        <div class="product-content">

          <div class="product-code">

            Código:
            {{ producto.codigo || 'Sin código' }}

          </div>


          <h3>
            {{ producto.nombre }}
          </h3>


          <p
            v-if="producto.descripcion"
            class="product-description"
          >
            {{ producto.descripcion }}
          </p>


          <div class="product-details">

            <div
              v-if="producto.marca"
              class="detail-item"
            >

              <span class="detail-label">
                Marca
              </span>

              <span class="detail-value">
                {{ producto.marca }}
              </span>

            </div>


            <div
              v-if="producto.modelo"
              class="detail-item"
            >

              <span class="detail-label">
                Modelo
              </span>

              <span class="detail-value">
                {{ producto.modelo }}
              </span>

            </div>

          </div>


          <!-- STOCK -->

          <div class="stock-row">

            <span>Stock disponible</span>

            <strong
              :class="{
                'stock-zero':
                  Number(producto.stock) <= 0,

                'stock-low':
                  Number(producto.stock) > 0 &&
                  Number(producto.stock) <=
                    Number(producto.stockMinimo || 0),
              }"
            >
              {{ producto.stock }}
            </strong>

          </div>


          <!-- CANTIDAD YA SELECCIONADA -->

          <div
            v-if="productoEnCarrito(producto._id)"
            class="cart-info"
          >

            <span class="material-icons">
              shopping_cart
            </span>

            En préstamo:

            <strong>
              {{ cantidadEnCarrito(producto._id) }}
            </strong>

          </div>


          <!-- BOTÓN -->

          <button
            type="button"
            class="detail-button"
            @click="abrirDetalle(producto)"
          >

            <span class="material-icons">
              visibility
            </span>

            Ver detalle

          </button>

        </div>

      </article>

    </section>


    <!-- ========================= -->
    <!-- MODAL DETALLE -->
    <!-- ========================= -->

    <div
      v-if="productoSeleccionado"
      class="modal-overlay"
      @click.self="cerrarDetalle"
    >

      <div class="product-modal">

        <!-- CERRAR -->

        <button
          type="button"
          class="modal-close"
          @click="cerrarDetalle"
        >

          <span class="material-icons">
            close
          </span>

        </button>


        <!-- IMAGEN -->

        <div class="modal-image-container">

          <img
            v-if="productoSeleccionado.imagenUrl"
            :src="productoSeleccionado.imagenUrl"
            :alt="productoSeleccionado.nombre"
            class="modal-image"
          />

          <div
            v-else
            class="modal-image-placeholder"
          >

            <span class="material-icons">
              inventory_2
            </span>

          </div>

        </div>


        <!-- INFORMACIÓN -->

        <div class="modal-content">

          <span
            class="status-badge"
            :class="estadoClase(productoSeleccionado)"
          >
            {{ obtenerEstado(productoSeleccionado) }}
          </span>


          <span class="modal-code">

            Código:
            {{ productoSeleccionado.codigo || 'Sin código' }}

          </span>


          <h2>
            {{ productoSeleccionado.nombre }}
          </h2>


          <p
            v-if="productoSeleccionado.descripcion"
            class="modal-description"
          >
            {{ productoSeleccionado.descripcion }}
          </p>


          <!-- DETALLES -->

          <div class="modal-details">

            <div class="modal-detail">

              <span>Marca</span>

              <strong>
                {{ productoSeleccionado.marca || 'N/A' }}
              </strong>

            </div>


            <div class="modal-detail">

              <span>Modelo</span>

              <strong>
                {{ productoSeleccionado.modelo || 'N/A' }}
              </strong>

            </div>


            <div class="modal-detail">

              <span>Categoría</span>

              <strong>
                {{ obtenerNombreCategoria(productoSeleccionado) }}
              </strong>

            </div>


            <div class="modal-detail">

              <span>Stock disponible</span>

              <strong>
                {{ productoSeleccionado.stock }}
              </strong>

            </div>


            <div class="modal-detail">

              <span>Stock mínimo</span>

              <strong>
                {{ productoSeleccionado.stockMinimo ?? 0 }}
              </strong>

            </div>


            <div class="modal-detail">

              <span>Precio</span>

              <strong>
                {{
                  formatearPrecio(
                    productoSeleccionado.precio,
                  )
                }}
              </strong>

            </div>

          </div>


          <!-- ========================= -->
          <!-- CANTIDAD -->
          <!-- ========================= -->

          <div
            v-if="puedeSolicitar(productoSeleccionado)"
            class="request-quantity"
          >

            <label for="cantidadSolicitud">
              Cantidad a solicitar
            </label>


            <div class="quantity-control">

              <button
                type="button"
                @click="
                  cantidadSolicitud = Math.max(
                    1,
                    Number(cantidadSolicitud) - 1,
                  )
                "
              >

                <span class="material-icons">
                  remove
                </span>

              </button>


              <input
                id="cantidadSolicitud"
                v-model.number="cantidadSolicitud"
                type="number"
                min="1"
                :max="productoSeleccionado.stock"
              />


              <button
                type="button"
                @click="
                  cantidadSolicitud = Math.min(
                    Number(productoSeleccionado.stock),
                    Number(cantidadSolicitud) + 1,
                  )
                "
              >

                <span class="material-icons">
                  add
                </span>

              </button>

            </div>

            
<div class="unit-selector">
  <label for="unidadSolicitud">
    Unidad de medida
  </label>

  <select
    id="unidadSolicitud"
    v-model="unidadSolicitud"
  >
    <option
      v-for="unidad in obtenerUnidadesDisponibles(productoSeleccionado)"
      :key="unidad"
      :value="unidad"
    >
      {{ unidad }}
    </option>
  </select>
</div>



            <small>
              Máximo disponible:
              {{ productoSeleccionado.stock }}
            </small>

          </div>


          <!-- PRODUCTO NO DISPONIBLE -->

          <div
            v-else
            class="not-available"
          >

            <span class="material-icons">
              block
            </span>

            Este producto no está disponible
            para solicitar en este momento.

          </div>


          <!-- YA AGREGADO -->

          <div
            v-if="
              productoEnCarrito(
                productoSeleccionado?._id,
              )
            "
            class="already-added"
          >

            <span class="material-icons">
              check_circle
            </span>

            Ya agregado:
            {{ cantidadEnCarrito(productoSeleccionado._id) }}
            unidad(es)

          </div>


          <!-- ========================= -->
          <!-- ACCIONES -->
          <!-- ========================= -->

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-button"
              @click="cerrarDetalle"
            >
              Cerrar
            </button>


            <button
              type="button"
              class="primary-button"
              :disabled="
                !puedeSolicitar(productoSeleccionado)
              "
              @click="
                solicitarProducto(productoSeleccionado)
              "
            >

              <span class="material-icons">
                add_shopping_cart
              </span>

              {{
                productoEnCarrito(
                  productoSeleccionado?._id,
                )
                  ? 'Actualizar cantidad'
                  : 'Agregar al préstamo'
              }}

            </button>

          </div>

        </div>

      </div>

    </div>


    <!-- ========================= -->
    <!-- TOAST -->
    <!-- ========================= -->

    <transition name="toast">

      <div
        v-if="mensaje"
        class="toast-message"
        :class="`toast-${mensajeTipo}`"
      >

        <span class="material-icons">

          {{
            mensajeTipo === 'success'
              ? 'check_circle'
              : 'error'
          }}

        </span>

        {{ mensaje }}

      </div>

    </transition>

  </div>

</template>


<script setup>

import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import { useRouter } from 'vue-router'

import api from '../../services/api'


const router = useRouter()


// =========================
// ESTADO
// =========================

const productos = ref([])

const categorias = ref([])

const cargando = ref(false)

const error = ref('')

const busqueda = ref('')

const categoriaSeleccionada = ref('')

const estadoSeleccionado = ref('')

const productoSeleccionado = ref(null)

const cantidadSolicitud = ref(1)


const unidadSolicitud = ref("")

const gruposUnidades = {
  longitud: {
    km: 1000,
    hm: 100,
    dam: 10,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
    um: 0.000001,
    mi: 1609.344,
  },
  masa: {
    t: 1000,
    kg: 1,
    hg: 0.1,
    dag: 0.01,
    g: 0.001,
    dg: 0.0001,
    cg: 0.00001,
    mg: 0.000001,
  },
  volumen: {
    kL: 1000,
    hL: 100,
    daL: 10,
    L: 1,
    dL: 0.1,
    cL: 0.01,
    mL: 0.001,
    ml: 0.001,
  },
  unidad: {
    unidad: 1,
  },
}

const convertirCantidadABase = (
  cantidad,
  unidadSolicitada,
  producto,
) => {
  const base = producto.unidadMedida || "unidad"
  const solicitada = unidadSolicitada || base
  const valor = Number(cantidad)

  if (!Number.isFinite(valor) || valor <= 0) {
    return null
  }

  if (solicitada === base) {
    return valor
  }

  if (
    solicitada === producto.unidadPresentacion &&
    Number(producto.cantidadPorPresentacion) > 0
  ) {
    return valor * Number(producto.cantidadPorPresentacion)
  }

  const grupoBase = Object.keys(gruposUnidades).find(
    (grupo) => Object.hasOwn(gruposUnidades[grupo], base),
  )

  const grupoSolicitado = Object.keys(gruposUnidades).find(
    (grupo) => Object.hasOwn(gruposUnidades[grupo], solicitada),
  )

  if (!grupoBase || grupoBase !== grupoSolicitado) {
    return null
  }

  return (
    valor *
    gruposUnidades[grupoBase][solicitada] /
    gruposUnidades[grupoBase][base]
  )
}


const obtenerUnidadesDisponibles = (producto) => {
  if (!producto) {
    return []
  }

  const base = producto.unidadMedida || "unidad"

  const grupoBase = Object.keys(gruposUnidades).find(
    (grupo) => Object.hasOwn(gruposUnidades[grupo], base),
  )

  const unidades = grupoBase
    ? Object.keys(gruposUnidades[grupoBase])
    : [base]

  if (!unidades.includes(base)) {
    unidades.unshift(base)
  }

  const presentacion = producto.unidadPresentacion

  if (
    presentacion &&
    !unidades.includes(presentacion) &&
    Number(producto.cantidadPorPresentacion) > 0
  ) {
    unidades.push(presentacion)
  }

  return unidades
}


const mensaje = ref('')

const mensajeTipo = ref('success')


// =========================
// CARRITO DE PRÉSTAMO
// =========================

const carritoPrestamo = ref([])


const cargarCarrito = () => {

  try {

    const carritoGuardado =
      sessionStorage.getItem(
        'carritoPrestamo',
      )

    carritoPrestamo.value =
      carritoGuardado
        ? JSON.parse(carritoGuardado)
        : []

  } catch (error) {

    console.error(
      'Error cargando carrito:',
      error,
    )

    carritoPrestamo.value = []

  }

}


const guardarCarrito = () => {

  sessionStorage.setItem(
    'carritoPrestamo',
    JSON.stringify(
      carritoPrestamo.value,
    ),
  )

}


const productoEnCarrito = (
  productoId,
) => {

  return carritoPrestamo.value.some(
    (item) =>
      item.producto === productoId,
  )

}


const cantidadEnCarrito = (
  productoId,
) => {

  const item =
    carritoPrestamo.value.find(
      (item) =>
        item.producto === productoId,
    )

  return item?.cantidad || 0

}


// =========================
// AGREGAR / ACTUALIZAR
// =========================

const agregarAlCarrito = (
  producto,
) => {

  if (!producto) {
    return
  }


  if (!puedeSolicitar(producto)) {

    mostrarMensaje(
      'Este producto no está disponible para préstamo.',
      'error',
    )

    return

  }


const cantidad = Number(cantidadSolicitud.value)

const unidadSolicitada =
  unidadSolicitud.value ||
  producto.unidadMedida ||
  "unidad"

if (!Number.isFinite(cantidad) || cantidad <= 0) {
  mostrarMensaje(
    "La cantidad debe ser mayor que cero.",
    "error",
  )
  return
}

if (
  unidadSolicitada === "unidad" &&
  !Number.isInteger(cantidad)
) {
  mostrarMensaje(
    "La cantidad de unidades debe ser un número entero.",
    "error",
  )
  return
}

const cantidadBase = convertirCantidadABase(
  cantidad,
  unidadSolicitada,
  producto,
)

if (cantidadBase === null || !Number.isFinite(cantidadBase)) {
  mostrarMensaje(
    `No se puede convertir ${unidadSolicitada} a ${producto.unidadMedida || "unidad"}.`,
    "error",
  )
  return
}

const stockDisponible = Number(producto.stock)

if (cantidadBase > stockDisponible) {
  mostrarMensaje(
    `Stock insuficiente. Solicitas ${cantidad} ${unidadSolicitada}, equivalentes a ${cantidadBase} ${producto.unidadMedida || "unidad"}. Disponible: ${stockDisponible} ${producto.unidadMedida || "unidad"}.`,
    "error",
  )
  return
}


  // =========================
  // ACTUALIZAR PRODUCTO EXISTENTE
  // =========================

  if (indice >= 0) {

    carritoPrestamo.value[indice] = {

      ...carritoPrestamo.value[indice],

      cantidad,

      unidadSolicitada,

unidadMedida: producto.unidadMedida || "unidad",

unidadPresentacion: producto.unidadPresentacion || "unidad",

cantidadPorPresentacion:
  Number(producto.cantidadPorPresentacion) || 1,

      stock: stockDisponible,

      codigo: producto.codigo,

      nombre: producto.nombre,

      imagenUrl:
        producto.imagenUrl || '',

    }

  }


  // =========================
  // AGREGAR NUEVO PRODUCTO
  // =========================

  else {

    carritoPrestamo.value.push({

      producto: producto._id,

      cantidad,unidadSolicitada,

unidadMedida: producto.unidadMedida || "unidad",

unidadPresentacion: producto.unidadPresentacion || "unidad",

cantidadPorPresentacion:
  Number(producto.cantidadPorPresentacion) || 1,

      codigo: producto.codigo,

      nombre: producto.nombre,

      stock: stockDisponible,

      imagenUrl:
        producto.imagenUrl || '',

    })

  }


  guardarCarrito()


  mostrarMensaje(
    `${producto.nombre} ${
      indice >= 0
        ? 'actualizado'
        : 'agregado'
    } en el préstamo.`,
    'success',
  )


  cerrarDetalle()

  cantidadSolicitud.value = 1

}


// =========================
// IR A SOLICITUD
// =========================

const irSolicitudPrestamo = () => {

  if (
    carritoPrestamo.value.length === 0
  ) {

    mostrarMensaje(
      'Primero agrega al menos un producto al préstamo.',
      'error',
    )

    return

  }


  router.push({
    name: 'solicitar-prestamo',
  })

}


// =========================
// SOLICITAR PRODUCTO
// =========================

const solicitarProducto = (
  producto,
) => {

  agregarAlCarrito(producto)

}


// =========================
// ABRIR DETALLE
// =========================

const abrirDetalle = (
  producto,
) => {

  productoSeleccionado.value =
    producto

    unidadSolicitud.value =
  carritoPrestamo.value.find(
    (item) => item.producto === producto._id,
  )?.unidadSolicitada ||
  producto.unidadMedida ||
  "unidad"

  const cantidadActual =
    cantidadEnCarrito(
      producto._id,
    )


  cantidadSolicitud.value =
    cantidadActual > 0
      ? cantidadActual
      : 1

}


// =========================
// CERRAR DETALLE
// =========================

const cerrarDetalle = () => {

  productoSeleccionado.value =
    null

  cantidadSolicitud.value = 1

  unidadSolicitud.value = ""

}


// =========================
// CARGAR PRODUCTOS
// =========================

const cargarProductos = async () => {

  try {

    const respuesta =
      await api.obtenerProductos()

    productos.value =
      Array.isArray(respuesta)
        ? respuesta
        : respuesta?.data || []

  } catch (err) {

    console.error(
      'Error cargando productos:',
      err,
    )

    throw err

  }

}


// =========================
// CARGAR CATEGORÍAS
// =========================

const cargarCategorias = async () => {

  try {

    const respuesta =
      await api.obtenerCategorias()

    categorias.value =
      Array.isArray(respuesta)
        ? respuesta
        : respuesta?.data || []

  } catch (err) {

    console.error(
      'Error cargando categorías:',
      err,
    )

    categorias.value = []

  }

}


// =========================
// CARGAR DATOS
// =========================

const cargarDatos = async () => {

  cargando.value = true

  error.value = ''

  try {

    await Promise.all([
      cargarProductos(),
      cargarCategorias(),
    ])

  } catch (err) {

    console.error(err)

    error.value =
      err?.message ||
      'Ocurrió un error al cargar el inventario.'

  } finally {

    cargando.value = false

  }

}


// =========================
// FILTROS
// =========================

const productosFiltrados =
  computed(() => {

    const texto =
      busqueda.value
        .trim()
        .toLowerCase()


    return productos.value.filter(
      (producto) => {

        const coincideBusqueda =
          !texto ||
          String(
            producto.codigo || '',
          )
            .toLowerCase()
            .includes(texto) ||
          String(
            producto.nombre || '',
          )
            .toLowerCase()
            .includes(texto)


        const categoriaProducto =
          producto.categoria?._id ||
          producto.categoria


        const coincideCategoria =
          !categoriaSeleccionada.value ||
          String(
            categoriaProducto || '',
          ) ===
            String(
              categoriaSeleccionada.value,
            )


        const coincideEstado =
          !estadoSeleccionado.value ||
          obtenerEstado(producto) ===
            estadoSeleccionado.value


        return (
          coincideBusqueda &&
          coincideCategoria &&
          coincideEstado
        )

      },
    )

  })


// =========================
// RESUMEN
// =========================

const productosDisponibles =
  computed(() => {

    return productos.value.filter(
      (producto) =>
        puedeSolicitar(producto),
    ).length

  })


const productosSinStock =
  computed(() => {

    return productos.value.filter(
      (producto) =>
        Number(producto.stock) <= 0,
    ).length

  })


// =========================
// ESTADO PRODUCTO
// =========================

const obtenerEstado = (
  producto,
) => {

  if (!producto) {
    return 'Sin estado'
  }


  if (
    producto.activo === false
  ) {

    return 'Retirado'

  }


  if (producto.estado) {

    return producto.estado

  }


  if (
    Number(producto.stock) <= 0
  ) {

    return 'Prestado'

  }


  return 'Disponible'

}


// =========================
// CLASE DEL ESTADO
// =========================

const estadoClase = (
  producto,
) => {

  const estado =
    obtenerEstado(producto)


  if (estado === 'Disponible') {

    return 'status-available'

  }


  if (estado === 'Prestado') {

    return 'status-loaned'

  }


  if (
    estado === 'Mantenimiento'
  ) {

    return 'status-maintenance'

  }


  if (estado === 'Dañado') {

    return 'status-damaged'

  }


  return 'status-retired'

}


// =========================
// PUEDE SOLICITAR
// =========================

const puedeSolicitar = (
  producto,
) => {

  if (!producto) {
    return false
  }


  if (
    producto.activo === false
  ) {

    return false

  }


  const estado =
    obtenerEstado(producto)


  if (
    estado !== 'Disponible'
  ) {

    return false

  }


  return Number(producto.stock) > 0

}


// =========================
// CATEGORÍA
// =========================

const obtenerNombreCategoria =
  (producto) => {

    if (!producto) {
      return 'Sin categoría'
    }


    if (
      producto.categoria &&
      typeof producto.categoria ===
        'object'
    ) {

      return (
        producto.categoria.nombre ||
        'Sin categoría'
      )

    }


    const categoria =
      categorias.value.find(
        (item) =>
          String(item._id) ===
          String(
            producto.categoria,
          ),
      )


    return (
      categoria?.nombre ||
      'Sin categoría'
    )

  }


// =========================
// PRECIO
// =========================

const formatearPrecio = (
  precio,
) => {

  if (
    precio === null ||
    precio === undefined ||
    precio === ''
  ) {

    return 'No registrado'

  }


  const numero = Number(precio)


  if (Number.isNaN(numero)) {

    return 'No registrado'

  }


  return new Intl.NumberFormat(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    },
  ).format(numero)

}


// =========================
// MENSAJES
// =========================

let mensajeTimeout = null


const mostrarMensaje = (
  texto,
  tipo = 'success',
) => {

  mensaje.value = texto

  mensajeTipo.value = tipo


  clearTimeout(
    mensajeTimeout,
  )


  mensajeTimeout = setTimeout(() => {

    mensaje.value = ''

  }, 3000)

}


// =========================
// SINCRONIZAR CARRITO
// =========================

watch(
  carritoPrestamo,
  () => {

    guardarCarrito()

  },
  {
    deep: true,
  },
)


// =========================
// INICIO
// =========================

onMounted(async () => {

  cargarCarrito()

  await cargarDatos()

})

</script>


<style scoped>

/* ========================= */
/* PÁGINA */
/* ========================= */

.inventario-page {

  width: 100%;

  min-height: 100%;

  padding: 28px;

  box-sizing: border-box;

  background: #f5f7fb;

}


/* ========================= */
/* ENCABEZADO */
/* ========================= */

.page-header {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 24px;

  margin-bottom: 26px;

}


.eyebrow {

  display: block;

  margin-bottom: 7px;

  color: #2563eb;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 1.4px;

}


.page-header h1 {

  margin: 0;

  color: #172033;

  font-size: 28px;

  font-weight: 850;

  letter-spacing: -0.5px;

}


.page-header p {

  margin: 8px 0 0;

  color: #737d8f;

  font-size: 13px;

  line-height: 1.6;

}


.header-actions {

  display: flex;

  align-items: center;

  gap: 10px;

}


/* ========================= */
/* BOTÓN ACTUALIZAR */
/* ========================= */

.refresh-button {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  min-height: 44px;

  padding: 0 16px;

  border: 1px solid #dbe1ea;

  border-radius: 10px;

  background: #ffffff;

  color: #374151;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;

}


.refresh-button:hover:not(:disabled) {

  border-color: #2563eb;

  color: #2563eb;

  background: #eff6ff;

}


.refresh-button:disabled {

  opacity: 0.55;

  cursor: not-allowed;

}


.refresh-button .material-icons {

  font-size: 19px;

}


/* ========================= */
/* CARRITO */
/* ========================= */

.loan-cart-button {

  display: inline-flex;

  align-items: center;

  gap: 9px;

  min-height: 44px;

  padding: 0 16px;

  border: 0;

  border-radius: 10px;

  background: #2563eb;

  color: #ffffff;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;

}


.loan-cart-button:hover {

  background: #1d4ed8;

  transform: translateY(-1px);

}


.loan-cart-button .material-icons {

  font-size: 20px;

}


.cart-total {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 24px;

  height: 24px;

  padding: 0 6px;

  border-radius: 20px;

  background: #ffffff;

  color: #2563eb;

  font-size: 11px;

  font-weight: 900;

}


/* ========================= */
/* FILTROS */
/* ========================= */

.filters-card {

  display: grid;

  grid-template-columns: 2fr 1fr 1fr;

  gap: 16px;

  padding: 20px;

  margin-bottom: 20px;

  border: 1px solid #e5e9f0;

  border-radius: 14px;

  background: #ffffff;

  box-shadow:
    0 4px 16px rgba(
      15,
      23,
      42,
      0.04
    );

}


.filter-group {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.filter-group label {

  color: #4b5563;

  font-size: 11px;

  font-weight: 850;

}


.filter-group input,
.filter-group select {

  width: 100%;

  height: 42px;

  box-sizing: border-box;

  border: 1px solid #dbe1ea;

  border-radius: 9px;

  outline: none;

  background: #ffffff;

  color: #172033;

  font-size: 13px;

  transition: 0.2s ease;

}


.filter-group input {

  padding: 0 12px 0 40px;

}


.filter-group select {

  padding: 0 12px;

}


.filter-group input:focus,
.filter-group select:focus {

  border-color: #2563eb;

  box-shadow: 0 0 0 3px #dbeafe;

}


.input-with-icon {

  position: relative;

}


.input-with-icon .material-icons {

  position: absolute;

  left: 13px;

  top: 50%;

  transform: translateY(-50%);

  color: #9aa3b2;

  font-size: 19px;

  pointer-events: none;

}


/* ========================= */
/* RESUMEN */
/* ========================= */

.summary-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 16px;

  margin-bottom: 24px;

}


.summary-card {

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 18px;

  border: 1px solid #e5e9f0;

  border-radius: 14px;

  background: #ffffff;

  box-shadow:
    0 4px 16px rgba(
      15,
      23,
      42,
      0.04
    );

}


.summary-icon {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 44px;

  height: 44px;

  border-radius: 11px;

}


.summary-icon.blue {

  background: #eff6ff;

  color: #2563eb;

}


.summary-icon.green {

  background: #ecfdf5;

  color: #059669;

}


.summary-icon.orange {

  background: #fff7ed;

  color: #ea580c;

}


.summary-icon .material-icons {

  font-size: 21px;

}


.summary-label {

  display: block;

  margin-bottom: 3px;

  color: #8992a1;

  font-size: 11px;

  font-weight: 700;

}


.summary-card strong {

  color: #172033;

  font-size: 22px;

  font-weight: 850;

}


/* ========================= */
/* PRODUCTOS */
/* ========================= */

.products-grid {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(275px, 1fr)
    );

  gap: 18px;

}


.product-card {

  overflow: hidden;

  border: 1px solid #e5e9f0;

  border-radius: 14px;

  background: #ffffff;

  box-shadow:
    0 4px 16px rgba(
      15,
      23,
      42,
      0.04
    );

  transition: 0.2s ease;

}


.product-card:hover {

  transform: translateY(-2px);

  box-shadow:
    0 10px 25px rgba(
      15,
      23,
      42,
      0.08
    );

}


.product-image-container {

  position: relative;

  height: 200px;

  overflow: hidden;

  background: #f8fafc;

}


.product-image {

  width: 100%;

  height: 100%;

  object-fit: contain;

  padding: 15px;

  box-sizing: border-box;

}


.product-image-placeholder {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 100%;

  height: 100%;

  color: #a1a9b7;

}


.product-image-placeholder .material-icons {

  font-size: 52px;

}


.status-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  width: fit-content;

  padding: 5px 9px;

  border-radius: 20px;

  font-size: 10px;

  font-weight: 850;

}


.product-image-container .status-badge {

  position: absolute;

  top: 12px;

  right: 12px;

}


.status-available {

  background: #dcfce7;

  color: #15803d;

}


.status-loaned {

  background: #fef3c7;

  color: #b45309;

}


.status-maintenance {

  background: #fef3c7;

  color: #b45309;

}


.status-damaged {

  background: #fee2e2;

  color: #b91c1c;

}


.status-retired {

  background: #fee2e2;

  color: #b91c1c;

}


/* ========================= */
/* CONTENIDO PRODUCTO */
/* ========================= */

.product-content {

  padding: 18px;

}


.product-code {

  margin-bottom: 6px;

  color: #8b95a5;

  font-size: 10px;

  font-weight: 750;

}


.product-content h3 {

  margin: 0;

  color: #172033;

  font-size: 17px;

  font-weight: 850;

  line-height: 1.3;

}


.product-description {

  display: -webkit-box;

  overflow: hidden;

  margin: 9px 0 0;

  color: #737d8f;

  font-size: 12px;

  line-height: 1.5;

  -webkit-box-orient: vertical;

}


.product-details {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 10px;

  margin-top: 15px;

  padding-top: 14px;

  border-top: 1px solid #edf0f4;

}


.detail-item {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.detail-label {

  color: #9aa3b2;

  font-size: 10px;

  font-weight: 700;

}


.detail-value {

  overflow: hidden;

  color: #374151;

  font-size: 11px;

  font-weight: 750;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.stock-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-top: 15px;

  padding: 11px 12px;

  border-radius: 9px;

  background: #f8fafc;

  color: #687386;

  font-size: 11px;

  font-weight: 700;

}


.stock-row strong {

  color: #059669;

  font-size: 14px;

  font-weight: 850;

}


.stock-row strong.stock-zero {

  color: #dc2626;

}


.stock-row strong.stock-low {

  color: #d97706;

}


/* ========================= */
/* INFO CARRITO PRODUCTO */
/* ========================= */

.cart-info {

  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 10px;

  padding: 9px 11px;

  border-radius: 8px;

  background: #eff6ff;

  color: #2563eb;

  font-size: 11px;

  font-weight: 700;

}


.cart-info strong {

  font-weight: 900;

}


.cart-info .material-icons {

  font-size: 17px;

}


/* ========================= */
/* BOTÓN DETALLE */
/* ========================= */

.detail-button {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  width: 100%;

  height: 40px;

  margin-top: 14px;

  border: 1px solid #dbe1ea;

  border-radius: 9px;

  background: #ffffff;

  color: #2563eb;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;

}


.detail-button:hover {

  background: #eff6ff;

  border-color: #bfdbfe;

}


.detail-button .material-icons {

  font-size: 18px;

}


/* ========================= */
/* ESTADOS */
/* ========================= */

.state-container {

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-height: 280px;

  padding: 30px;

  border: 1px solid #e5e9f0;

  border-radius: 14px;

  background: #ffffff;

  text-align: center;

}


.state-container .material-icons {

  margin-bottom: 12px;

  color: #9aa3b2;

  font-size: 46px;

}


.state-container h3 {

  margin: 0;

  color: #172033;

  font-size: 17px;

}


.state-container p {

  margin: 7px 0 0;

  color: #8992a1;

  font-size: 12px;

}


.state-container.error-state .material-icons {

  color: #dc2626;

}


.loading-icon {

  animation: spin 1s linear infinite;

}


@keyframes spin {

  to {

    transform: rotate(360deg);

  }

}


/* ========================= */
/* MODAL */
/* ========================= */

.modal-overlay {

  position: fixed;

  inset: 0;

  z-index: 1000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 25px;

  box-sizing: border-box;

  background: rgba(
    15,
    23,
    42,
    0.55
  );

  backdrop-filter: blur(3px);

}


.product-modal {

  position: relative;

  display: grid;

  grid-template-columns:
    0.9fr 1.1fr;

  width: min(
    850px,
    100%
  );

  max-height: 90vh;

  overflow: auto;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 25px 60px rgba(
      15,
      23,
      42,
      0.22
    );

}


.modal-close {

  position: absolute;

  z-index: 2;

  top: 14px;

  right: 14px;

  display: flex;

  align-items: center;

  justify-content: center;

  width: 36px;

  height: 36px;

  border: 0;

  border-radius: 50%;

  background: rgba(
    255,
    255,
    255,
    0.95
  );

  color: #475569;

  cursor: pointer;

  box-shadow:
    0 3px 10px rgba(
      15,
      23,
      42,
      0.08
    );

}


.modal-close:hover {

  color: #dc2626;

}


.modal-image-container {

  min-height: 470px;

  background: #f8fafc;

}


.modal-image {

  width: 100%;

  height: 100%;

  min-height: 470px;

  object-fit: contain;

  padding: 30px;

  box-sizing: border-box;

}


.modal-image-placeholder {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 100%;

  height: 100%;

  min-height: 470px;

  color: #a1a9b7;

}


.modal-image-placeholder .material-icons {

  font-size: 80px;

}


.modal-content {

  padding: 36px;

}


.modal-code {

  display: block;

  margin-top: 14px;

  color: #8b95a5;

  font-size: 10px;

  font-weight: 750;

}


.modal-content h2 {

  margin: 7px 0 0;

  color: #172033;

  font-size: 25px;

  font-weight: 850;

}


.modal-description {

  margin: 10px 0 0;

  color: #737d8f;

  font-size: 13px;

  line-height: 1.6;

}


.modal-details {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;

  margin-top: 22px;

}


.modal-detail {

  padding: 12px;

  border-radius: 9px;

  background: #f8fafc;

}


.modal-detail span {

  display: block;

  margin-bottom: 4px;

  color: #929baa;

  font-size: 10px;

  font-weight: 700;

}


.modal-detail strong {

  color: #374151;

  font-size: 12px;

  font-weight: 800;

}


/* ========================= */
/* CANTIDAD */
/* ========================= */

.request-quantity {

  margin-top: 24px;

  padding: 16px;

  border: 1px solid #e5e7eb;

  border-radius: 12px;

  background: #f8fafc;

}


.request-quantity label {

  display: block;

  margin-bottom: 8px;

  color: #374151;

  font-size: 12px;

  font-weight: 800;

}


.quantity-control {

  display: flex;

  align-items: center;

  gap: 8px;

}


.quantity-control button {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 40px;

  height: 40px;

  border: 1px solid #dbe1ea;

  border-radius: 9px;

  background: #ffffff;

  color: #2563eb;

  cursor: pointer;

}


.quantity-control button:hover {

  background: #eff6ff;

}


.quantity-control .material-icons {

  font-size: 19px;

}


.quantity-control input {

  width: 70px;

  height: 40px;

  box-sizing: border-box;

  border: 1px solid #dbe1ea;

  border-radius: 9px;

  outline: none;

  text-align: center;

  color: #172033;

  font-size: 14px;

  font-weight: 800;

}


.quantity-control input:focus {

  border-color: #2563eb;

  box-shadow:
    0 0 0 3px #dbeafe;

}


.request-quantity small {

  display: block;

  margin-top: 7px;

  color: #8992a1;

  font-size: 11px;

}


/* ========================= */
/* NO DISPONIBLE */
/* ========================= */

.not-available {

  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 20px;

  padding: 12px;

  border-radius: 9px;

  background: #fef2f2;

  color: #b91c1c;

  font-size: 12px;

  font-weight: 700;

}


.not-available .material-icons {

  font-size: 18px;

}


/* ========================= */
/* YA AGREGADO */
/* ========================= */

.already-added {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 12px;

  padding: 10px 12px;

  border-radius: 9px;

  background: #ecfdf5;

  color: #047857;

  font-size: 12px;

  font-weight: 700;

}


.already-added .material-icons {

  font-size: 18px;

}


/* ========================= */
/* ACCIONES MODAL */
/* ========================= */

.modal-actions {

  display: flex;

  justify-content: flex-end;

  gap: 10px;

  margin-top: 24px;

}


.primary-button,
.secondary-button {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  min-height: 42px;

  padding: 0 16px;

  border-radius: 9px;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;

  transition: 0.2s ease;

}


.primary-button {

  border: 0;

  background: #2563eb;

  color: #ffffff;

}


.primary-button:hover:not(:disabled) {

  background: #1d4ed8;

}


.primary-button:disabled {

  opacity: 0.5;

  cursor: not-allowed;

}


.primary-button .material-icons {

  font-size: 18px;

}


.secondary-button {

  border: 1px solid #dbe1ea;

  background: #ffffff;

  color: #475569;

}


.secondary-button:hover {

  background: #f8fafc;

}


/* ========================= */
/* TOAST */
/* ========================= */

.toast-message {

  position: fixed;

  z-index: 2000;

  right: 24px;

  bottom: 24px;

  display: flex;

  align-items: center;

  gap: 9px;

  max-width: 380px;

  padding: 13px 16px;

  border-radius: 10px;

  background: #172033;

  color: #ffffff;

  font-size: 12px;

  font-weight: 700;

  box-shadow:
    0 10px 30px rgba(
      15,
      23,
      42,
      0.18
    );

}


.toast-message .material-icons {

  font-size: 19px;

}


.toast-success .material-icons {

  color: #34d399;

}


.toast-error .material-icons {

  color: #f87171;

}


.toast-enter-active,
.toast-leave-active {

  transition: 0.25s ease;

}


.toast-enter-from,
.toast-leave-to {

  opacity: 0;

  transform: translateY(10px);

}


/* ========================= */
/* RESPONSIVE */
/* ========================= */

@media (max-width: 900px) {

  .filters-card {

    grid-template-columns: 1fr;

  }


  .summary-grid {

    grid-template-columns: 1fr;

  }


  .product-modal {

    grid-template-columns: 1fr;

  }


  .modal-image-container,
  .modal-image {

    min-height: 300px;

    height: 300px;

  }

}


@media (max-width: 700px) {

  .inventario-page {

    padding: 18px;

  }


  .page-header {

    align-items: stretch;

    flex-direction: column;

  }


  .header-actions {

    width: 100%;

  }


  .loan-cart-button,
  .refresh-button {

    flex: 1;

  }


  .products-grid {

    grid-template-columns: 1fr;

  }


  .modal-overlay {

    padding: 10px;

  }


  .modal-content {

    padding: 24px;

  }


  .modal-details {

    grid-template-columns: 1fr;

  }


  .modal-actions {

    flex-direction: column-reverse;

  }


  .primary-button,
  .secondary-button {

    width: 100%;

  }


  .toast-message {

    right: 15px;

    bottom: 15px;

    left: 15px;

    max-width: none;

  }

}

</style>