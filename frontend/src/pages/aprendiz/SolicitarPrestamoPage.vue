<template>
  <div class="solicitud-page">
    <!-- ========================= -->
    <!-- ENCABEZADO -->
    <!-- ========================= -->

<section class="page-header">
  <div>
    <span class="eyebrow">
      SOLICITUD DE PRÉSTAMO
    </span>

    <h1>
      Solicitar préstamo
    </h1>

    <p>
      Completa la información para enviar tu solicitud al administrador.
    </p>
  </div>

  <button
    class="btn-secondary"
    type="button"
    @click="volverInventario"
  >
    <span class="material-icons">
      arrow_back
    </span>

    Volver al inventario
  </button>
</section>

<!-- ========================= -->
<!-- CARGANDO -->
<!-- ========================= -->

<div
  v-if="cargandoProductos"
  class="loading-card"
>
  <span class="material-icons spin">
    sync
  </span>

  <p>
    Cargando información de los productos...
  </p>
</div>

<!-- ========================= -->
<!-- ERROR -->
<!-- ========================= -->

<div
  v-else-if="errorProductos"
  class="error-card"
>
  <span class="material-icons">
    error_outline
  </span>

  <div>
    <strong>
      No fue posible cargar los productos
    </strong>

    <p>
      {{ errorProductos }}
    </p>

    <button
      type="button"
      class="retry-button"
      @click="cargarProductosSolicitud"
    >
      Intentar nuevamente
    </button>
  </div>
</div>

<!-- ========================= -->
<!-- SIN PRODUCTOS -->
<!-- ========================= -->

<div
  v-else-if="productosSolicitud.length === 0"
  class="empty-cart-card"
>
  <div class="empty-cart-icon">
    <span class="material-icons">
      shopping_cart
    </span>
  </div>

  <h2>
    No hay productos en el préstamo
  </h2>

  <p>
    Regresa al inventario y agrega uno o varios productos
    antes de continuar.
  </p>

  <button
    type="button"
    class="btn-submit empty-cart-button"
    @click="volverInventario"
  >
    <span class="material-icons">
      inventory_2
    </span>

    Ir al inventario
  </button>
</div>

<!-- ========================= -->
<!-- FORMULARIO -->
<!-- ========================= -->

<form
  v-else
  @submit.prevent="enviarSolicitud"
>
  <div class="form-grid">

    <!-- ========================= -->
    <!-- COLUMNA PRINCIPAL -->
    <!-- ========================= -->

    <div class="main-column">

      <!-- ========================= -->
      <!-- PRODUCTOS -->
      <!-- ========================= -->

      <section class="form-card">

        <div class="card-heading">
          <div class="heading-icon blue">
            <span class="material-icons">
              inventory_2
            </span>
          </div>

          <div>
            <h2>
              Productos solicitados
            </h2>

            <p>
              Revisa los productos y las cantidades que deseas solicitar.
            </p>
          </div>
        </div>

        <div class="productos-lista">

          <article
            v-for="item in productosSolicitud"
            :key="item.producto"
            class="producto-item"
            :class="{
              'producto-no-disponible':
                item.productoNoEncontrado ||
                item.stock <= 0 ||
                item.activo === false
            }"
          >

            <!-- IMAGEN -->

            <div class="producto-imagen">
              <img
                v-if="item.imagenUrl"
                :src="item.imagenUrl"
                :alt="item.nombre"
              />

              <span
                v-else
                class="material-icons"
              >
                inventory_2
              </span>
            </div>

            <!-- INFORMACIÓN -->

            <div class="producto-info">

              <span class="producto-codigo">
                Código:
                {{ item.codigo || 'Sin código' }}
              </span>

              <h3>
                {{ item.nombre }}
              </h3>

              <div class="producto-meta">
                <span>
                  <strong>Stock:</strong>
                  {{ item.stock }} {{ item.unidadMedida || 'unidad' }}
                </span>
              </div>

              <span
                v-if="
                  item.productoNoEncontrado ||
                  item.stock <= 0 ||
                  item.activo === false
                "
                class="producto-alerta"
              >
                <span class="material-icons">
                  warning
                </span>

                Producto no disponible
              </span>
            </div>

            <!-- CANTIDAD -->

            <div class="cantidad-box">

              <label>
                Cantidad ({{ item.unidadMedida || 'unidad' }})
              </label>

              <div class="quantity-control">

                <button
                  type="button"
                  :disabled="
                    item.productoNoEncontrado ||
                    item.stock <= 0 ||
                    item.cantidad <= 0.001
                  "
                  @click="disminuirCantidad(item)"
                >
                  <span class="material-icons">
                    remove
                  </span>
                </button>

                <input
                  v-model.number="item.cantidad"
                  type="number"
                  min="0.001"
                  step="0.001"
                  :max="item.stock"
                  :disabled="
                    item.productoNoEncontrado ||
                    item.stock <= 0 ||
                    item.activo === false
                  "
                  @change="corregirCantidad(item)"
                />

                <button
                  type="button"
                  :disabled="
                    item.productoNoEncontrado ||
                    item.stock <= 0 ||
                    item.activo === false ||
                    item.cantidad >= Number(item.stock)
                  "
                  @click="aumentarCantidad(item)"
                >
                  <span class="material-icons">
                    add
                  </span>
                </button>

              </div>

              <small>
                Máximo:
                {{ item.stock }}
              </small>
            </div>

            <!-- ELIMINAR -->

            <button
              type="button"
              class="remove-product-button"
              title="Eliminar producto"
              @click="eliminarProducto(item.producto)"
            >
              <span class="material-icons">
                delete
              </span>
            </button>

          </article>

        </div>

        <!-- AGREGAR MÁS -->

        <button
          type="button"
          class="add-more-button"
          @click="volverInventario"
        >
          <span class="material-icons">
            add
          </span>

          Agregar otro producto
        </button>

        <!-- TOTAL -->

        <div class="products-total">
          <div>
            <span class="material-icons">
              shopping_cart
            </span>

            <span>
              {{ productosSolicitud.length }}
              {{
                productosSolicitud.length === 1
                  ? 'producto'
                  : 'productos'
              }}
            </span>
          </div>

          <strong>
            {{ totalUnidades }}
            {{
              totalUnidades === 1
                ? 'unidad'
                : 'unidades'
            }}
          </strong>
        </div>

      </section>

      <!-- ========================= -->
      <!-- DATOS DEL SOLICITANTE -->
      <!-- ========================= -->

      <section class="form-card">

        <div class="card-heading">

          <div class="heading-icon green">
            <span class="material-icons">
              person
            </span>
          </div>

          <div>
            <h2>
              Datos del solicitante
            </h2>

            <p>
              Información necesaria para registrar el préstamo.
            </p>
          </div>

        </div>

        <div class="fields-grid">

          <!-- NOMBRE -->

          <div class="field full">
            <label for="nombreSolicitante">
              Nombre completo
              <span>*</span>
            </label>

            <input
              id="nombreSolicitante"
              v-model.trim="formulario.nombreSolicitante"
              type="text"
              placeholder="Escribe tu nombre completo"
              required
            />

            <small>
              Este nombre aparecerá en la solicitud de préstamo.
            </small>
          </div>

          <!-- IDENTIFICACIÓN -->

          <div class="field">
            <label for="identificacion">
              Identificación
              <span>*</span>
            </label>

            <input
              id="identificacion"
              v-model.trim="formulario.identificacion"
              type="text"
              placeholder="Ej. 1234567890"
              required
            />
          </div>

          <!-- ÁREA -->

          <div class="field">
            <label for="areaPrograma">
              Área o programa
              <span>*</span>
            </label>

            <input
              id="areaPrograma"
              v-model.trim="formulario.areaPrograma"
              type="text"
              placeholder="Ej. ADSO"
              required
            />
          </div>

          <!-- CORREO -->

          <div class="field">
            <label for="correo">
              Correo electrónico
              <span>*</span>
            </label>

            <input
              id="correo"
              v-model.trim="formulario.correo"
              type="email"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <!-- TELÉFONO -->

          <div class="field">
            <label for="telefono">
              Teléfono
              <span>*</span>
            </label>

            <input
              id="telefono"
              v-model.trim="formulario.telefono"
              type="tel"
              placeholder="Ej. 3001234567"
              required
            />
          </div>

        </div>

      </section>

      <!-- ========================= -->
      <!-- DATOS DEL PRÉSTAMO -->
      <!-- ========================= -->

      <section class="form-card">

        <div class="card-heading">

          <div class="heading-icon orange">
            <span class="material-icons">
              event
            </span>
          </div>

          <div>
            <h2>
              Datos del préstamo
            </h2>

            <p>
              Indica cuándo y dónde necesitas recibir los productos.
            </p>
          </div>

        </div>

        <div class="fields-grid">

          <!-- FECHA -->

          <div class="field">
            <label for="fechaSolicitud">
              Fecha de solicitud de objeto
              <span>*</span>
            </label>

            <input
              id="fechaSolicitud"
              v-model="formulario.fechaSolicitud"
              type="date"
              readonly
            />
          </div>

          <!-- LUGAR -->

          <div class="field">
            <label for="lugarEntrega">
              Lugar de entrega
              <span>*</span>
            </label>

            <input
              id="lugarEntrega"
              v-model.trim="formulario.lugarEntrega"
              type="text"
              placeholder="Ej. Ambiente de formación"
              required
            />
          </div>

          <!-- OBSERVACIONES -->

          <div class="field full">
            <label for="observaciones">
              Observaciones
            </label>

            <textarea
              id="observaciones"
              v-model.trim="formulario.observaciones"
              rows="5"
              placeholder="Agrega alguna observación relacionada con la solicitud..."
            ></textarea>
          </div>

        </div>

      </section>

    </div>

    <!-- ========================= -->
    <!-- RESUMEN -->
    <!-- ========================= -->

    <aside class="summary-column">

      <section class="summary-card">

        <!-- ENCABEZADO -->

        <div class="summary-header">

          <span class="material-icons">
            description
          </span>

          <div>
            <h2>
              Resumen
            </h2>

            <p>
              Revisa tu solicitud
            </p>
          </div>

        </div>

        <!-- PRODUCTOS -->

        <div class="summary-products-wrapper">

          <div class="summary-products">

            <span class="summary-label">
              Productos
            </span>

            <div
              v-for="item in productosSolicitud"
              :key="`summary-${item.producto}`"
              class="summary-product-item"
            >

              <div>
                <strong>
                  {{ item.nombre }}
                </strong>

                <span>
                  {{ item.codigo || 'Sin código' }}
                </span>
              </div>

              <b>
                x{{ item.cantidad }}
              </b>

            </div>

          </div>

        </div>

        <!-- TOTAL -->

        <div class="summary-row total-row">
          <span>
            Total de unidades
          </span>

          <strong>
            {{ totalUnidades }}
          </strong>
        </div>

        <!-- FECHA -->

        <div class="summary-row">
          <span>
            Fecha de solicitud de objeto
          </span>

          <strong>
            {{ fechaFormateada }}
          </strong>
        </div>

        <!-- ESTADO -->

        <div class="summary-row">

          <span>
            Estado inicial
          </span>

          <span class="status-badge">
            Pendiente
          </span>

        </div>

        <!-- AVISO -->

        <div class="summary-notice">

          <span class="material-icons">
            info
          </span>

          <p>
            La solicitud quedará pendiente hasta que un administrador
            la revise.
          </p>

        </div>

        <!-- ACCIONES -->

        <div class="summary-actions">

          <button
            class="btn-submit"
            type="submit"
            :disabled="
              enviando ||
              productosSolicitud.length === 0
            "
          >

            <span
              v-if="enviando"
              class="material-icons spin"
            >
              sync
            </span>

            <span
              v-else
              class="material-icons"
            >
              send
            </span>

            {{
              enviando
                ? 'Enviando...'
                : 'Enviar solicitud'
            }}

          </button>

          <button
            class="btn-cancel"
            type="button"
            :disabled="enviando"
            @click="volverInventario"
          >
            Cancelar
          </button>

        </div>

      </section>

    </aside>

  </div>
</form>

<!-- ========================= -->
<!-- MODAL DE ÉXITO -->
<!-- ========================= -->

<div
  v-if="mostrarExito"
  class="modal-overlay"
>

  <div class="success-modal">

    <div class="success-icon">
      <span class="material-icons">
        check
      </span>
    </div>

    <h2>
      Solicitud enviada
    </h2>

    <p>
      Tu solicitud de préstamo fue registrada correctamente y quedó
      pendiente de aprobación.
    </p>

    <div class="success-actions">

      <button
        class="btn-secondary"
        type="button"
        @click="volverInventario"
      >
        Volver al inventario
      </button>

      <button
        class="btn-submit"
        type="button"
        @click="irMisPrestamos"
      >
        Ver mis préstamos
      </button>

    </div>

  </div>

</div>

  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../../services/api'

const router = useRouter()
const $q = useQuasar()

// =========================
// ESTADO
// =========================

const productosSolicitud = ref([])
const cargandoProductos = ref(true)
const errorProductos = ref('')
const enviando = ref(false)
const mostrarExito = ref(false)
const usuario = ref(null)

// =========================
// FORMULARIO
// =========================

const formulario = reactive({
  nombreSolicitante: '',
  identificacion: '',
  areaPrograma: '',
  correo: '',
  telefono: '',
  fechaSolicitud: '',
  lugarEntrega: '',
  observaciones: '',
})

// =========================
// FECHA ACTUAL
// =========================

const obtenerFechaActual = () => {
  const hoy = new Date()

  const year = hoy.getFullYear()

  const month = String(
    hoy.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    hoy.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// =========================
// FECHA MÍNIMA
// =========================

const fechaMinima = computed(() => {
  return obtenerFechaActual()
})

// =========================
// FECHA FORMATEADA
// =========================

const fechaFormateada = computed(() => {
  if (!formulario.fechaSolicitud) {
    return 'No seleccionada'
  }

  const fecha = new Date(
    `${formulario.fechaSolicitud}T00:00:00`,
  )

  if (Number.isNaN(fecha.getTime())) {
    return 'No válida'
  }

  return fecha.toLocaleDateString(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  )
})

// =========================
// TOTAL DE UNIDADES
// =========================

const totalUnidades = computed(() => {
  return productosSolicitud.value.reduce(
    (total, item) => {
      return total + Number(item.cantidad || 0)
    },
    0,
  )
})

// =========================
// CARGAR USUARIO
// =========================

const cargarUsuario = () => {
  try {
    const usuarioGuardado =
      sessionStorage.getItem('usuario')

    if (!usuarioGuardado) {
      formulario.fechaSolicitud =
        fechaMinima.value

      return
    }

    usuario.value =
      JSON.parse(usuarioGuardado)

    formulario.nombreSolicitante =
      usuario.value?.nombre || ''

    formulario.correo =
      usuario.value?.correo || ''

    formulario.identificacion =
      usuario.value?.identificacion || ''

    formulario.areaPrograma =
      usuario.value?.areaPrograma || ''

    formulario.telefono =
      usuario.value?.telefono || ''

    formulario.fechaSolicitud =
      fechaMinima.value

  } catch (error) {
    console.error(
      'No fue posible cargar el usuario:',
      error,
    )

    formulario.fechaSolicitud =
      fechaMinima.value
  }
}

// =========================
// CARGAR CARRITO
// =========================

const cargarCarrito = () => {
  try {
    const carritoGuardado =
      sessionStorage.getItem(
        'carritoPrestamo',
      )

    if (!carritoGuardado) {
      productosSolicitud.value = []
      return
    }

    const carrito =
      JSON.parse(carritoGuardado)

    if (!Array.isArray(carrito)) {
      productosSolicitud.value = []
      return
    }

    productosSolicitud.value =
      carrito.map((item) => ({
        producto: item.producto,
        cantidad: Number(
          item.cantidad || 1,
        ),

        codigo:
          item.codigo || '',

        nombre:
          item.nombre ||
          'Producto',

        stock: Number(
          item.stock || 0,
        ),

       
unidadMedida: item.unidadMedida || 'unidad',

unidadSolicitada:
  item.unidadSolicitada ||
  item.unidadMedida ||
  'unidad',

unidadPresentacion:
  item.unidadPresentacion || 'unidad',

cantidadPorPresentacion:
  Number(item.cantidadPorPresentacion) || 1,

imagenUrl:
  item.imagenUrl || '',

        productoNoEncontrado:
          false,

        activo:
          true,
      }))

  } catch (error) {
    console.error(
      'No fue posible cargar el carrito:',
      error,
    )

    productosSolicitud.value = []

    errorProductos.value =
      'No fue posible leer los productos seleccionados.'
  }
}

// =========================
// GUARDAR CARRITO
// =========================

const guardarCarrito = () => {
  sessionStorage.setItem(
    'carritoPrestamo',
    JSON.stringify(
      productosSolicitud.value,
    ),
  )
}

// =========================
// CARGAR PRODUCTOS ACTUALES
// =========================

const cargarProductosSolicitud =
  async () => {

    cargandoProductos.value = true
    errorProductos.value = ''

    try {
      cargarCarrito()

      if (
        productosSolicitud.value.length === 0
      ) {
        return
      }

      const productosActuales =
        await api.obtenerProductos()

      productosSolicitud.value =
        productosSolicitud.value.map(
          (item) => {

            const productoActual =
              productosActuales.find(
                (producto) =>
                  String(
                    producto._id,
                  ) ===
                  String(
                    item.producto,
                  ),
              )

            // Producto que ya no existe

            if (!productoActual) {
              return {
                ...item,
                stock: 0,
                productoNoEncontrado:
                  true,
                activo: false,
              }
            }

            return {
              ...item,

              codigo:
                productoActual.codigo ||
                item.codigo ||
                '',

              nombre:
                productoActual.nombre ||
                item.nombre ||
                'Producto',

              stock: Number(
                productoActual.stock || 0,
              ),

              unidadMedida: productoActual.unidadMedida || 'unidad',

              imagenUrl:
                productoActual.imagenUrl ||
                item.imagenUrl ||
                '',

              productoNoEncontrado:
                false,

              activo:
                productoActual.activo !== false,
            }
          },
        )

      // Ajustar cantidades según stock actual

      productosSolicitud.value.forEach(
        (item) => {

          const stock =
            Number(item.stock)

          // Producto sin stock

          if (
            stock <= 0 ||
            item.activo === false ||
            item.productoNoEncontrado
          ) {
            item.cantidad = 0
            return
          }

          // Si supera el stock

          if (
            Number(item.cantidad) >
            stock
          ) {
            item.cantidad = stock
          }

          // Mantener una cantidad positiva.

          if (Number(item.cantidad) <= 0) {
            item.cantidad = Math.min(1, stock)
          }
        },
      )

      guardarCarrito()

    } catch (error) {

      console.error(
        'Error cargando productos:',
        error,
      )

      errorProductos.value =
        error.message ||
        'No fue posible cargar la información actual del inventario.'

    } finally {
      cargandoProductos.value = false
    }
  }

// =========================
// AUMENTAR CANTIDAD
// =========================

const aumentarCantidad = (item) => {

  if (
    item.productoNoEncontrado ||
    item.activo === false
  ) {
    return
  }

  const stock =
    Number(item.stock)

  const cantidadActual =
    Number(item.cantidad)

  if (
    cantidadActual >= stock
  ) {

    $q.notify({
      type: 'warning',

      message:
        `No puedes solicitar más de ${stock} unidades de ${item.nombre}.`,

      position: 'top-right',
      timeout: 3000,
    })

    return
  }

  item.cantidad =
    cantidadActual + 1

  guardarCarrito()
}

// =========================
// DISMINUIR CANTIDAD
// =========================

const disminuirCantidad = (item) => {

  if (
    item.productoNoEncontrado ||
    item.activo === false
  ) {
    return
  }

  const cantidadActual =
    Number(item.cantidad)

  if (
    cantidadActual <= 1
  ) {
    return
  }

  item.cantidad =
    cantidadActual - 1

  guardarCarrito()
}

// =========================
// CORREGIR CANTIDAD
// =========================

const corregirCantidad = (item) => {

  if (
    item.productoNoEncontrado ||
    item.activo === false
  ) {
    item.cantidad = 0
    guardarCarrito()
    return
  }

  let cantidad =
    Number(item.cantidad)

  const stock =
    Number(item.stock)

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    cantidad = Math.min(1, stock)
  }

  if (
    stock <= 0
  ) {

    cantidad = 0

  } else if (
    cantidad > stock
  ) {

    cantidad = stock

    $q.notify({
      type: 'warning',

      message:
        `La cantidad de ${item.nombre} se ajustó al stock disponible (${stock}).`,

      position: 'top-right',
      timeout: 3000,
    })
  }

  item.cantidad =
    cantidad

  guardarCarrito()
}

// =========================
// ELIMINAR PRODUCTO
// =========================

const eliminarProducto = (
  productoId,
) => {

  const producto =
    productosSolicitud.value.find(
      (item) =>
        item.producto ===
        productoId,
    )

  productosSolicitud.value =
    productosSolicitud.value.filter(
      (item) =>
        item.producto !==
        productoId,
    )

  guardarCarrito()

  $q.notify({
    type: 'positive',

    message:
      `${producto?.nombre || 'Producto'} eliminado del préstamo.`,

    position: 'top-right',
    timeout: 2500,
  })
}

// =========================
// VALIDAR PRODUCTOS
// =========================

const validarProductos = () => {

  if (
    productosSolicitud.value.length === 0
  ) {
    return 'Debes agregar al menos un producto al préstamo.'
  }

  for (
    const item of productosSolicitud.value
  ) {

    if (
      item.productoNoEncontrado
    ) {
      return `El producto "${item.nombre}" ya no existe en el inventario. Elimínalo de la solicitud.`
    }

    if (
      item.activo === false
    ) {
      return `El producto "${item.nombre}" ya no está disponible. Elimínalo de la solicitud.`
    }

    const cantidad =
      Number(item.cantidad)

    const stock =
      Number(item.stock)

    if (
      !Number.isFinite(cantidad) ||
      cantidad <= 0
    ) {
      return `La cantidad de ${item.nombre} debe ser un número positivo.`
    }

    if (
      stock <= 0
    ) {
      return `El producto "${item.nombre}" no tiene stock disponible.`
    }

    if (
      cantidad > stock
    ) {
      return `La cantidad solicitada de ${item.nombre} supera el stock disponible (${stock}).`
    }
  }

  return ''
}

// =========================
// VALIDAR FORMULARIO
// =========================

const validarFormulario = () => {

  const errorProductos =
    validarProductos()

  if (errorProductos) {
    return errorProductos
  }

  if (
    !formulario.nombreSolicitante
  ) {
    return 'Ingresa el nombre completo del solicitante.'
  }

  if (
    !formulario.identificacion
  ) {
    return 'Ingresa tu número de identificación.'
  }

  if (
    !formulario.areaPrograma
  ) {
    return 'Ingresa tu área o programa.'
  }

  if (
    !formulario.correo
  ) {
    return 'Ingresa tu correo electrónico.'
  }

  if (
    !formulario.telefono
  ) {
    return 'Ingresa tu número de teléfono.'
  }

  if (
    !formulario.fechaSolicitud
  ) {
    return 'No fue posible establecer la fecha de solicitud.'
  }

  if (
    formulario.fechaSolicitud <
    fechaMinima.value
  ) {
    return 'La fecha de solicitud no puede ser anterior a hoy.'
  }

  if (
    !formulario.lugarEntrega
  ) {
    return 'Ingresa el lugar de entrega.'
  }

  return ''
}

// =========================
// VERIFICAR STOCK ACTUAL
// =========================

const verificarStockActual =
  async () => {

    const productosActuales =
      await api.obtenerProductos()

    for (
      const item of productosSolicitud.value
    ) {

      const productoActual =
        productosActuales.find(
          (producto) =>
            String(
              producto._id,
            ) ===
            String(
              item.producto,
            ),
        )

      // Producto eliminado

      if (!productoActual) {
        throw new Error(
          `El producto "${item.nombre}" ya no existe en el inventario.`,
        )
      }

      // Producto inactivo

      if (
        productoActual.activo === false
      ) {
        throw new Error(
          `El producto "${productoActual.nombre}" ya no está disponible.`,
        )
      }

      // Stock actual

      const stockActual =
        Number(
          productoActual.stock,
        )

      // Sin stock

      if (
        stockActual <= 0
      ) {
        throw new Error(
          `El producto "${productoActual.nombre}" ya no tiene stock disponible.`,
        )
      }

      // Stock insuficiente

      if (
        Number(item.cantidad) >
        stockActual
      ) {
        throw new Error(
          `El producto "${productoActual.nombre}" ahora tiene solo ${stockActual} unidad(es) disponible(s).`,
        )
      }

      // Actualizar información local

      item.stock =
        stockActual

      item.nombre =
        productoActual.nombre

      item.codigo =
        productoActual.codigo ||
        item.codigo

      item.imagenUrl =
        productoActual.imagenUrl ||
        item.imagenUrl

      item.activo =
        productoActual.activo !== false
    }

    guardarCarrito()
  }

// =========================
// ENVIAR SOLICITUD
// =========================

const enviarSolicitud = async () => {

  const errorValidacion =
    validarFormulario()

  if (errorValidacion) {

    $q.notify({
      type: 'negative',

      message:
        errorValidacion,

      position: 'top-right',
      timeout: 3500,
    })

    return
  }

  enviando.value = true

  try {

    // Verificar nuevamente el stock

    await verificarStockActual()

    /*
     * IMPORTANTE:
     * fechaSolicitud NO se envía.
     *
     * La fecha debe generarse automáticamente
     * en el backend al crear el préstamo.
     */

    const prestamo = {

      nombreSolicitante:
        formulario.nombreSolicitante,

      identificacion:
        formulario.identificacion,

      areaPrograma:
        formulario.areaPrograma,

      correo:
        formulario.correo,

      telefono:
        formulario.telefono,

      lugarEntrega:
        formulario.lugarEntrega,

   
productos:
  productosSolicitud.value.map(
    (item) => ({
      producto: item.producto,

      cantidad: Number(item.cantidad),

      unidadSolicitada:
        item.unidadSolicitada ||
        item.unidadMedida ||
        "unidad",
    }),
  ),

      observaciones:
        formulario.observaciones,
    }

    console.log(
      'Solicitud que se enviará:',
      prestamo,
    )

    await api.crearPrestamo(
      prestamo,
    )

    // Limpiar carrito

    sessionStorage  .removeItem(
      'carritoPrestamo',
    )

    productosSolicitud.value = []

    mostrarExito.value = true

    $q.notify({
      type: 'positive',

      message:
        'Solicitud de préstamo enviada correctamente.',

      position: 'top-right',
      timeout: 3000,
    })

  } catch (error) {

    console.error(
      'Error enviando solicitud:',
      error,
    )

    $q.notify({
      type: 'negative',

      message:
        error.message ||
        'No fue posible enviar la solicitud.',

      position: 'top-right',
      timeout: 4500,
    })

  } finally {
    enviando.value = false
  }
}

// =========================
// VOLVER AL INVENTARIO
// =========================

const volverInventario = () => {

  router.push({
    name: 'inventario-aprendiz',
  })
}

// =========================
// MIS PRÉSTAMOS
// =========================

const irMisPrestamos = () => {

  router.push({
    name: 'mis-prestamos-aprendiz',
  })
}

// =========================
// INICIO
// =========================

onMounted(async () => {

  cargarUsuario()

  await cargarProductosSolicitud()
})
</script>

<style scoped>
/* ========================= */
/* PÁGINA */
/* ========================= */

.solicitud-page {
  min-height: 100%;
  padding: 32px;
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
  margin-bottom: 28px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: 32px;
  font-weight: 800;
}

.page-header p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-secondary:hover {
  border-color: #2563eb;
  color: #2563eb;
  transform: translateY(-1px);
}

/* ========================= */
/* GRID PRINCIPAL */
/* ========================= */

.form-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    360px;
  gap: 24px;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card,
.summary-card {
  border: 1px solid #e6eaf0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 4px 18px rgba(20, 34, 56, 0.05);
}

.form-card {
  padding: 24px;
}

/* ========================= */
/* TITULOS CARDS */
/* ========================= */

.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eef1f5;
  margin-bottom: 22px;
}

.card-heading h2 {
  margin: 0;
  color: #172033;
  font-size: 18px;
  font-weight: 800;
}

.card-heading p {
  margin: 5px 0 0;
  color: #7b8494;
  font-size: 13px;
}

.heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.heading-icon.blue {
  background: #eaf2ff;
  color: #2563eb;
}

.heading-icon.green {
  background: #eafaf1;
  color: #16a34a;
}

.heading-icon.orange {
  background: #fff5e8;
  color: #ea8b16;
}

/* ========================= */
/* LISTA PRODUCTOS */
/* ========================= */

.productos-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.producto-item {
  display: grid;
  grid-template-columns:
    64px
    minmax(0, 1fr)
    150px
    40px;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e9f0;
  border-radius: 13px;
  background: #fafbfc;
  transition: 0.2s ease;
}

.producto-item.producto-no-disponible {
  border-color: #fecaca;
  background: #fff7f7;
}

.producto-imagen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 11px;
  background: #eaf2ff;
  color: #2563eb;
}

.producto-no-disponible .producto-imagen {
  background: #fee2e2;
  color: #dc2626;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
  box-sizing: border-box;
}

.producto-imagen .material-icons {
  font-size: 30px;
}

.producto-info {
  min-width: 0;
}

.producto-codigo {
  display: block;
  margin-bottom: 5px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.producto-info h3 {
  overflow: hidden;
  margin: 0;
  color: #172033;
  font-size: 15px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.producto-meta {
  display: flex;
  gap: 12px;
  margin-top: 7px;
  color: #687385;
  font-size: 11px;
}

.producto-meta strong {
  color: #374151;
}

.producto-alerta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 7px;
  color: #dc2626;
  font-size: 10px;
  font-weight: 800;
}

.producto-alerta .material-icons {
  font-size: 15px;
}

/* ========================= */
/* CANTIDAD */
/* ========================= */

.cantidad-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cantidad-box label {
  color: #374151;
  font-size: 11px;
  font-weight: 800;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quantity-control button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 36px;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #2563eb;
  cursor: pointer;
  transition: 0.2s ease;
}

.quantity-control button:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.quantity-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-control .material-icons {
  font-size: 17px;
}

.quantity-control input {
  width: 58px;
  height: 36px;
  box-sizing: border-box;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #ffffff;
  color: #172033;
  outline: none;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
}

.quantity-control input:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.09);
}

.quantity-control input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.cantidad-box small {
  color: #8992a1;
  font-size: 10px;
}

/* ========================= */
/* ELIMINAR */
/* ========================= */

.remove-product-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 9px;
  background: #fff1f2;
  color: #dc2626;
  cursor: pointer;
  transition: 0.2s ease;
}

.remove-product-button:hover {
  background: #fee2e2;
}

.remove-product-button .material-icons {
  font-size: 19px;
}

/* ========================= */
/* AGREGAR MÁS */
/* ========================= */

.add-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  margin-top: 15px;
  padding: 0 14px;
  border: 1px dashed #bfdbfe;
  border-radius: 9px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.add-more-button:hover {
  background: #dbeafe;
}

.add-more-button .material-icons {
  font-size: 18px;
}

/* ========================= */
/* TOTAL PRODUCTOS */
/* ========================= */

.products-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #f0f6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.products-total > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.products-total .material-icons {
  font-size: 19px;
}

.products-total strong {
  color: #172033;
  font-size: 14px;
  font-weight: 850;
}

/* ========================= */
/* CAMPOS */
/* ========================= */

.fields-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.field label span {
  color: #dc2626;
}

.field input,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d8dee8;
  border-radius: 9px;
  background: #ffffff;
  color: #172033;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: 0.2s ease;
}

.field input {
  height: 44px;
  padding: 0 12px;
}

.field textarea {
  min-height: 120px;
  padding: 12px;
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.09);
}

.field small {
  color: #8992a1;
  font-size: 11px;
}

.field input[readonly] {
  background: #f4f6f9;
  color: #5f6877;
  cursor: not-allowed;
}

/* ========================= */
/* RESUMEN */
/* ========================= */

.summary-column {
  position: sticky;
  top: 24px;
  align-self: start;
  min-width: 0;
}

.summary-card {
  display: flex;
  flex-direction: column;
  height: min(
    calc(100vh - 48px),
    760px
  );
  min-height: 520px;
  box-sizing: border-box;
  padding: 24px;
  overflow: hidden;
}

/* ========================= */
/* ENCABEZADO RESUMEN */
/* ========================= */

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #eef1f5;
}

.summary-header > .material-icons {
  color: #2563eb;
  font-size: 28px;
}

.summary-header h2 {
  margin: 0;
  color: #172033;
  font-size: 18px;
  font-weight: 800;
}

.summary-header p {
  margin: 4px 0 0;
  color: #858e9d;
  font-size: 12px;
}

/* ========================= */
/* RESUMEN PRODUCTOS */
/* ========================= */

.summary-products-wrapper {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.summary-products {
  height: 100%;
  box-sizing: border-box;
  padding: 18px 4px 18px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.summary-products::-webkit-scrollbar {
  width: 6px;
}

.summary-products::-webkit-scrollbar-track {
  background: transparent;
}

.summary-products::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd5e1;
}

.summary-products::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.summary-label {
  display: block;
  margin-bottom: 10px;
  color: #8992a1;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
}

.summary-product-item > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.summary-product-item strong {
  overflow: hidden;
  color: #172033;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-product-item span {
  color: #2563eb;
  font-size: 10px;
  font-weight: 700;
}

.summary-product-item b {
  flex-shrink: 0;
  color: #172033;
  font-size: 12px;
}

/* ========================= */
/* FILAS RESUMEN */
/* ========================= */

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 15px 0;
  border-top: 1px solid #eef1f5;
  color: #697383;
  font-size: 13px;
}

.summary-row strong {
  color: #172033;
}

.total-row strong {
  color: #2563eb;
  font-size: 17px;
}

.status-badge {
  padding: 5px 9px;
  border-radius: 999px;
  background: #fff5d8;
  color: #a16207;
  font-size: 11px;
  font-weight: 800;
}

/* ========================= */
/* AVISO */
/* ========================= */

.summary-notice {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  margin: 14px 0;
  padding: 13px;
  border-radius: 10px;
  background: #f0f6ff;
  color: #2563eb;
}

.summary-notice .material-icons {
  flex-shrink: 0;
  font-size: 20px;
}

.summary-notice p {
  margin: 0;
  color: #536174;
  font-size: 12px;
  line-height: 1.5;
}

/* ========================= */
/* ACCIONES RESUMEN */
/* ========================= */

.summary-actions {
  flex-shrink: 0;
  padding-top: 2px;
}

/* ========================= */
/* BOTONES */
/* ========================= */

.btn-submit {
  width: 100%;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit .material-icons {
  font-size: 19px;
}

.btn-cancel {
  width: 100%;
  min-height: 44px;
  margin-top: 10px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel:hover {
  color: #dc2626;
}

.retry-button {
  min-height: 38px;
  margin-top: 12px;
  padding: 0 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #ffffff;
  color: #dc2626;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

/* ========================= */
/* CARGANDO / ERROR */
/* ========================= */

.loading-card,
.error-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 150px;
  padding: 28px;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  background: #ffffff;
}

.loading-card {
  justify-content: center;
  flex-direction: column;
  color: #64748b;
}

.loading-card .material-icons {
  color: #2563eb;
  font-size: 30px;
}

.loading-card p {
  margin: 0;
}

.error-card {
  color: #dc2626;
}

.error-card > .material-icons {
  font-size: 30px;
}

.error-card strong {
  display: block;
  color: #991b1b;
}

.error-card p {
  margin: 5px 0 0;
  color: #7f1d1d;
  font-size: 13px;
}

/* ========================= */
/* CARRITO VACÍO */
/* ========================= */

.empty-cart-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 330px;
  padding: 35px;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  background: #ffffff;
  text-align: center;
  box-shadow:
    0 4px 18px rgba(20, 34, 56, 0.05);
}

.empty-cart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
}

.empty-cart-icon .material-icons {
  font-size: 34px;
}

.empty-cart-card h2 {
  margin: 0;
  color: #172033;
  font-size: 20px;
  font-weight: 800;
}

.empty-cart-card p {
  max-width: 430px;
  margin: 9px 0 22px;
  color: #7b8494;
  font-size: 13px;
  line-height: 1.6;
}

.empty-cart-button {
  width: auto;
  padding: 0 20px;
}

/* ========================= */
/* MODAL ÉXITO */
/* ========================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.55);
}

.success-modal {
  width: min(500px, 100%);
  padding: 34px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 20px 60px rgba(15, 23, 42, 0.2);
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
}

.success-icon .material-icons {
  font-size: 34px;
}

.success-modal h2 {
  margin: 0;
  color: #172033;
  font-size: 24px;
}

.success-modal > p {
  max-width: 390px;
  margin: 12px auto 24px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.success-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.success-actions .btn-secondary,
.success-actions .btn-submit {
  width: 100%;
}

/* ========================= */
/* ANIMACIÓN */
/* ========================= */

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================= */
/* RESPONSIVE */
/* ========================= */

@media (max-width: 1000px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .summary-column {
    position: static;
  }

  .summary-card {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .summary-products-wrapper {
    flex: none;
    overflow: visible;
  }

  .summary-products {
    height: auto;
    max-height: 320px;
    overflow-y: auto;
  }
}

@media (max-width: 800px) {
  .producto-item {
    grid-template-columns:
      56px
      minmax(0, 1fr)
      40px;
  }

  .producto-imagen {
    width: 56px;
    height: 56px;
  }

  .cantidad-box {
    grid-column: 1 / -1;
  }

  .remove-product-button {
    grid-column: 3;
    grid-row: 1;
  }
}

@media (max-width: 700px) {
  .solicitud-page {
    padding: 20px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }

  .success-actions {
    grid-template-columns: 1fr;
  }

  .producto-item {
    grid-template-columns:
      56px
      minmax(0, 1fr)
      40px;
  }

  .producto-info h3 {
    font-size: 13px;
  }

  .products-total {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
}
</style>
