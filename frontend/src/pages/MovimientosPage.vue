<template>
  <div class="movimientos-page">
    <!-- ============================== -->
    <!-- ENCABEZADO -->
    <!-- ============================== -->

    <div class="page-header">
      <div>
        <div class="eyebrow">GESTIÓN DE INVENTARIO</div>

        <h1>Movimientos</h1>

        <p>
          Consulta y administra el historial de entradas, salidas,
          devoluciones y ajustes del inventario.
        </p>
      </div>

      <div class="acciones-header">
        <q-btn
          color="primary"
          icon="add"
          label="Registrar movimiento"
          @click="abrirRegistro"
        />

        <q-btn
          color="negative"
          outline
          icon="delete_sweep"
          label="Borrar historial"
          :disable="cargando || !movimientos.length"
          @click="confirmarBorrarHistorial"
        />

        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarMovimientos"
        />
      </div>
    </div>

    <!-- ============================== -->
    <!-- RESUMEN -->
    <!-- ============================== -->

    <div class="resumen-grid">
      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-total">
            <q-icon name="swap_vert" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Total movimientos</span>
            <strong>{{ movimientos.length }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-entrada">
            <q-icon name="south_west" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Entradas</span>
            <strong>{{ cantidadPorTipo('Entrada') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-salida">
            <q-icon name="north_east" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Salidas</span>
            <strong>{{ cantidadPorTipo('Salida') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-devolucion">
            <q-icon name="assignment_return" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Devoluciones</span>
            <strong>{{ cantidadPorTipo('Devolución') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-ajuste">
            <q-icon name="tune" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Ajustes</span>
            <strong>{{ cantidadPorTipo('Ajuste') }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- ============================== -->
    <!-- FILTROS -->
    <!-- ============================== -->

    <q-card flat bordered class="filtros-card">
      <q-card-section>
        <div class="filtros-grid">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            label="Buscar movimiento"
            placeholder="Producto, código o usuario"
            class="filtro-busqueda"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroTipo"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Tipo de movimiento"
            :options="opcionesTipo"
          />

          <q-btn
            flat
            color="primary"
            icon="filter_alt_off"
            label="Limpiar filtros"
            :disable="!busqueda && !filtroTipo"
            @click="limpiarFiltros"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- ============================== -->
    <!-- TABLA -->
    <!-- ============================== -->

    <q-card flat bordered class="tabla-card">
      <q-card-section class="tabla-header">
        <div>
          <h2>Historial de movimientos</h2>

          <span>
            {{ movimientosFiltrados.length }}
            movimiento(s) mostrado(s)
          </span>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="movimientosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay movimientos registrados"
        loading-label="Cargando movimientos..."
        :rows-per-page-options="[10, 20, 50, 0]"
      >
        <!-- PRODUCTO -->

        <template #body-cell-producto="props">
          <q-td :props="props">
            <div class="producto-cell">
              <div class="producto-icono">
                <q-icon name="inventory_2" size="20px" />
              </div>

              <div>
                <div class="nombre-producto">
                  {{ props.row.producto?.nombre || 'Producto no disponible' }}
                </div>

                <div class="dato-secundario">
                  Código:
                  {{ props.row.producto?.codigo || '—' }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- TIPO -->

        <template #body-cell-tipo="props">
          <q-td :props="props">
            <div class="tipo-movimiento">
              <q-icon
                :name="iconoTipo(props.row.tipo)"
                :color="colorIconoTipo(props.row.tipo)"
                size="20px"
              />

              <q-badge
                rounded
                :color="colorTipo(props.row.tipo)"
                :label="props.row.tipo"
              />
            </div>
          </q-td>
        </template>

        <!-- CANTIDAD -->

        <template #body-cell-cantidad="props">
          <q-td :props="props">
            <strong class="cantidad">
              {{ props.row.cantidad }} {{ props.row.producto?.unidadMedida || '' }}
            </strong>
          </q-td>
        </template>

        <!-- USUARIO -->

        <template #body-cell-usuarioResponsable="props">
          <q-td :props="props">
            <div class="usuario-cell">
              <div class="avatar-usuario">
                <q-icon name="person" size="18px" />
              </div>

              <div>
                <div class="nombre-usuario">
                  {{
                    props.row.usuarioResponsable?.nombre ||
                    'Usuario no disponible'
                  }}
                </div>

                <div class="dato-secundario">
                  {{
                    props.row.usuarioResponsable?.correo ||
                    'Sin correo'
                  }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- FECHA -->

        <template #body-cell-fecha="props">
          <q-td :props="props">
            <div class="fecha-cell">
              <q-icon name="event" size="17px" />

              {{ formatearFecha(props.row.createdAt) }}
            </div>
          </q-td>
        </template>

        <!-- OBSERVACIÓN -->

        <template #body-cell-observacion="props">
          <q-td :props="props">
            <div class="observacion-cell">
              {{ props.row.observacion || 'Sin observación' }}
            </div>
          </q-td>
        </template>

        <!-- ACCIONES -->

        <template #body-cell-acciones="props">
          <q-td :props="props" class="acciones-cell">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click="verDetalle(props.row)"
            >
              <q-tooltip>
                Ver detalle
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ============================== -->
    <!-- DIALOGO DETALLE -->
    <!-- ============================== -->

    <q-dialog v-model="dialogoDetalle">
      <q-card class="dialogo-detalle">
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">
              MOVIMIENTO
            </div>

            <h2>
              Detalle del movimiento
            </h2>

            <p>
              Información completa del movimiento seleccionado.
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            @click="dialogoDetalle = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="movimientoSeleccionado"
          class="detalle-contenido"
        >
          <!-- TIPO -->

          <div class="detalle-tipo">
            <span>Tipo de movimiento</span>

            <q-badge
              rounded
              :color="colorTipo(movimientoSeleccionado.tipo)"
              :label="movimientoSeleccionado.tipo"
            />
          </div>

          <!-- PRODUCTO -->

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="inventory_2" />

              <span>
                Producto
              </span>
            </div>

            <div class="producto-detalle">
              <div class="producto-icono grande">
                <q-icon name="inventory_2" size="26px" />
              </div>

              <div class="producto-info">
                <strong>
                  {{
                    movimientoSeleccionado.producto?.nombre ||
                    'Producto no disponible'
                  }}
                </strong>

                <span>
                  Código:
                  {{
                    movimientoSeleccionado.producto?.codigo ||
                    '—'
                  }}
                </span>

                <span>
                  Estado actual:
                  {{
                    movimientoSeleccionado.producto?.estado ||
                    '—'
                  }}
                </span>
              </div>
            </div>
          </div>

          <q-separator />

          <!-- INFORMACIÓN -->

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="info" />

              <span>
                Información del movimiento
              </span>
            </div>

            <div class="detalle-grid">
              <div class="detalle-item">
                <span>
                  Cantidad
                </span>

                <strong>
                  {{ movimientoSeleccionado.cantidad }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Fecha
                </span>

                <strong>
                  {{
                    formatearFechaHora(
                      movimientoSeleccionado.createdAt,
                    )
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Stock actual
                </span>

                <strong>
                  {{
                    movimientoSeleccionado.producto?.stock ??
                    '—'
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Stock mínimo
                </span>

                <strong>
                  {{
                    movimientoSeleccionado.producto?.stockMinimo ??
                    '—'
                  }}
                </strong>
              </div>
            </div>
          </div>

          <q-separator />

          <!-- RESPONSABLE -->

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="person" />

              <span>
                Usuario responsable
              </span>
            </div>

            <div class="responsable-detalle">
              <div class="avatar-usuario grande">
                <q-icon name="person" size="22px" />
              </div>

              <div>
                <strong>
                  {{
                    movimientoSeleccionado.usuarioResponsable
                      ?.nombre ||
                    'Usuario no disponible'
                  }}
                </strong>

                <span>
                  {{
                    movimientoSeleccionado.usuarioResponsable
                      ?.correo ||
                    'Sin correo'
                  }}
                </span>

                <span>
                  Rol:
                  {{
                    movimientoSeleccionado.usuarioResponsable
                      ?.rol ||
                    '—'
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- OBSERVACIÓN -->

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="notes" />

              <span>
                Observación
              </span>
            </div>

            <div class="observaciones">
              {{
                movimientoSeleccionado.observacion ||
                'Sin observación registrada.'
              }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            color="grey-7"
            label="Cerrar"
            @click="dialogoDetalle = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO REGISTRAR -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoRegistro"
      persistent
    >
      <q-card class="dialogo-registro">
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">
              INVENTARIO
            </div>

            <h2>
              Registrar movimiento
            </h2>

            <p>
              Registra una entrada, salida, devolución o ajuste
              de inventario.
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="guardando"
            @click="cerrarRegistro"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form
            ref="formularioMovimiento"
            @submit.prevent="registrar"
          >
            <div class="form-grid">
              <!-- PRODUCTO -->

              <q-select
                v-model="formulario.producto"
                outlined
                label="Producto *"
                :options="productos"
                option-label="nombre"
                option-value="_id"
                emit-value
                map-options
                use-input
                input-debounce="0"
                :loading="cargandoProductos"
                :rules="[
                  (valor) =>
                    !!valor ||
                    'Selecciona un producto',
                ]"
                @filter="filtrarProductos"
              >
                <template #prepend>
                  <q-icon name="inventory_2" />
                </template>

                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.nombre }}
                      </q-item-label>

                      <q-item-label caption>
                        Código:
                        {{ scope.opt.codigo || '—' }}
                        · Stock:
                        {{ scope.opt.stock ?? 0 }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- TIPO -->

              <q-select
                v-model="formulario.tipo"
                outlined
                label="Tipo de movimiento *"
                :options="opcionesTipo"
                emit-value
                map-options
                :rules="[
                  (valor) =>
                    !!valor ||
                    'Selecciona el tipo de movimiento',
                ]"
              >
                <template #prepend>
                  <q-icon name="swap_vert" />
                </template>
              </q-select>

              <!-- CANTIDAD -->

              <q-input
                v-model.number="formulario.cantidad"
                outlined
                type="number"
                min="0.001"
                step="0.001"
                :label="`Cantidad (${productoSeleccionado?.unidadMedida || 'unidad'}) *`"
                :rules="[
                  (valor) =>
                    valor !== null &&
                    valor !== undefined &&
                    valor !== '' ||
                    'La cantidad es obligatoria',

                  (valor) =>
                    Number.isFinite(Number(valor)) ||
                    'Debe ser un número válido',

                  (valor) =>
                    Number(valor) > 0 ||
                    'Debe ser mayor que cero',
                ]"
              >
                <template #prepend>
                  <q-icon name="numbers" />
                </template>
              </q-input>

              <!-- OBSERVACIÓN -->

              <q-input
                v-model="formulario.observacion"
                outlined
                type="textarea"
                label="Observación"
                placeholder="Describe el motivo del movimiento..."
                maxlength="500"
                counter
                rows="4"
                class="campo-observacion"
              >
                <template #prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>
            </div>

            <!-- INFORMACIÓN DEL PRODUCTO -->

            <div
              v-if="productoSeleccionado"
              class="producto-seleccionado"
            >
              <div class="producto-seleccionado-header">
                <div>
                  <span>
                    Producto seleccionado
                  </span>

                  <strong>
                    {{ productoSeleccionado.nombre }}
                  </strong>
                </div>

                <q-badge
                  color="primary"
                  :label="`Stock actual: ${productoSeleccionado.stock ?? 0}`"
                />
              </div>

              <div class="producto-seleccionado-grid">
                <div>
                  <span>
                    Código
                  </span>

                  <strong>
                    {{ productoSeleccionado.codigo || '—' }}
                  </strong>
                </div>

                <div>
                  <span>
                    Stock mínimo
                  </span>

                  <strong>
                    {{ productoSeleccionado.stockMinimo ?? 0 }}
                  </strong>
                </div>

                <div>
                  <span>
                    Estado
                  </span>

                  <strong>
                    {{ productoSeleccionado.estado || '—' }}
                  </strong>
                </div>
              </div>
            </div>

            <q-banner
              v-if="formulario.tipo === 'Salida'"
              class="banner-aviso"
              rounded
            >
              <template #avatar>
                <q-icon
                  name="warning"
                  color="orange"
                />
              </template>

              Una salida disminuirá el stock del producto.
              El backend validará que exista stock suficiente.
            </q-banner>

            <q-banner
              v-if="
                formulario.tipo === 'Entrada' ||
                formulario.tipo === 'Devolución'
              "
              class="banner-aviso"
              rounded
            >
              <template #avatar>
                <q-icon
                  name="info"
                  color="primary"
                />
              </template>

              Este movimiento aumentará el stock del producto.
            </q-banner>

            <q-banner
              v-if="formulario.tipo === 'Ajuste'"
              class="banner-aviso"
              rounded
            >
              <template #avatar>
                <q-icon
                  name="tune"
                  color="primary"
                />
              </template>

              El ajuste establecerá el stock del producto en
              la cantidad indicada.
            </q-banner>

            <div class="dialogo-acciones">
              <q-btn
                flat
                color="grey-7"
                label="Cancelar"
                :disable="guardando"
                @click="cerrarRegistro"
              />

              <q-btn
                color="primary"
                icon="save"
                label="Registrar movimiento"
                type="submit"
                :loading="guardando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useQuasar,
} from 'quasar'

import api from '../services/api'

const $q = useQuasar()

// ==============================
// ESTADO
// ==============================

const movimientos = ref([])

const productos = ref([])
const productosOriginales = ref([])

const cargando = ref(false)
const cargandoProductos = ref(false)
const guardando = ref(false)

const busqueda = ref('')
const filtroTipo = ref(null)

const dialogoDetalle = ref(false)
const movimientoSeleccionado = ref(null)

const dialogoRegistro = ref(false)

const formularioMovimiento = ref(null)

const formulario = ref({
  producto: null,
  tipo: null,
  cantidad: 1,
  observacion: '',
})

// ==============================
// COLUMNAS
// ==============================

const columnas = [
  {
    name: 'producto',
    label: 'PRODUCTO',
    field: 'producto',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tipo',
    label: 'TIPO',
    field: 'tipo',
    align: 'center',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'CANTIDAD',
    field: 'cantidad',
    align: 'center',
    sortable: true,
  },
  {
    name: 'usuarioResponsable',
    label: 'RESPONSABLE',
    field: 'usuarioResponsable',
    align: 'left',
  },
  {
    name: 'fecha',
    label: 'FECHA',
    field: 'createdAt',
    align: 'center',
    sortable: true,
  },
  {
    name: 'observacion',
    label: 'OBSERVACIÓN',
    field: 'observacion',
    align: 'left',
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    field: '_id',
    align: 'center',
  },
]

// ==============================
// OPCIONES
// ==============================

const opcionesTipo = [
  {
    label: 'Entrada',
    value: 'Entrada',
  },
  {
    label: 'Salida',
    value: 'Salida',
  },
  {
    label: 'Devolución',
    value: 'Devolución',
  },
  {
    label: 'Ajuste',
    value: 'Ajuste',
  },
]

// ==============================
// FILTROS
// ==============================

const movimientosFiltrados = computed(() => {
  const texto = busqueda.value
    .trim()
    .toLowerCase()

  return movimientos.value.filter(
    (movimiento) => {
      const coincideTipo =
        !filtroTipo.value ||
        movimiento.tipo === filtroTipo.value

      if (!coincideTipo) {
        return false
      }

      if (!texto) {
        return true
      }

      const nombreProducto =
        movimiento.producto?.nombre ||
        ''

      const codigoProducto =
        movimiento.producto?.codigo ||
        ''

      const nombreUsuario =
        movimiento.usuarioResponsable?.nombre ||
        ''

      const correoUsuario =
        movimiento.usuarioResponsable?.correo ||
        ''

      const observacion =
        movimiento.observacion ||
        ''

      return (
        nombreProducto
          .toLowerCase()
          .includes(texto) ||
        codigoProducto
          .toLowerCase()
          .includes(texto) ||
        nombreUsuario
          .toLowerCase()
          .includes(texto) ||
        correoUsuario
          .toLowerCase()
          .includes(texto) ||
        observacion
          .toLowerCase()
          .includes(texto)
      )
    },
  )
})

// ==============================
// CANTIDADES
// ==============================

const cantidadPorTipo = (tipo) => {
  return movimientos.value.filter(
    (movimiento) =>
      movimiento.tipo === tipo,
  ).length
}

// ==============================
// CARGAR MOVIMIENTOS
// ==============================

const cargarMovimientos = async () => {
  cargando.value = true

  try {
    movimientos.value =
      await api.obtenerMovimientos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar los movimientos.',
    })
  } finally {
    cargando.value = false
  }
}

// ==============================
// CARGAR PRODUCTOS
// ==============================

const cargarProductos = async () => {
  cargandoProductos.value = true

  try {
    const datos =
      await api.obtenerProductos()

    productosOriginales.value =
      Array.isArray(datos)
        ? datos
        : []

    productos.value =
      [...productosOriginales.value]
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar los productos.',
    })
  } finally {
    cargandoProductos.value = false
  }
}

// ==============================
// FILTRAR PRODUCTOS
// ==============================

const filtrarProductos = (
  valor,
  actualizar,
) => {
  actualizar(() => {
    if (!valor) {
      productos.value =
        [...productosOriginales.value]

      return
    }

    const texto =
      valor.toLowerCase()

    productos.value =
      productosOriginales.value.filter(
        (producto) =>
          producto.nombre
            ?.toLowerCase()
            .includes(texto) ||
          producto.codigo
            ?.toLowerCase()
            .includes(texto),
      )
  })
}

// ==============================
// PRODUCTO SELECCIONADO
// ==============================

const productoSeleccionado =
  computed(() => {
    if (!formulario.value.producto) {
      return null
    }

    return (
      productosOriginales.value.find(
        (producto) =>
          producto._id ===
          formulario.value.producto,
      ) || null
    )
  })

// ==============================
// LIMPIAR FILTROS
// ==============================

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroTipo.value = null
}

// ==============================
// DETALLE
// ==============================

const verDetalle = (movimiento) => {
  movimientoSeleccionado.value =
    movimiento

  dialogoDetalle.value = true
}

// ==============================
// REGISTRO
// ==============================

const abrirRegistro = async () => {
  formulario.value = {
    producto: null,
    tipo: null,
    cantidad: 1,
    observacion: '',
  }

  dialogoRegistro.value = true

  if (!productosOriginales.value.length) {
    await cargarProductos()
  }
}

const cerrarRegistro = () => {
  if (guardando.value) {
    return
  }

  dialogoRegistro.value = false
}

// ==============================
// REGISTRAR
// ==============================

const registrar = async () => {
  const valido =
    await formularioMovimiento.value?.validate()

  if (!valido) {
    return
  }

  guardando.value = true

  try {
    await api.registrarMovimiento({
      producto:
        formulario.value.producto,

      tipo:
        formulario.value.tipo,

      cantidad:
        Number(
          formulario.value.cantidad,
        ),

      observacion:
        formulario.value.observacion
          ?.trim() || '',
    })

    $q.notify({
      type: 'positive',
      message:
        'Movimiento registrado correctamente.',
    })

    dialogoRegistro.value = false

    await Promise.all([
      cargarMovimientos(),
      cargarProductos(),
    ])
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible registrar el movimiento.',
    })
  } finally {
    guardando.value = false
  }
}

// ==============================
// TIPOS
// ==============================

const colorTipo = (tipo) => {
  switch (tipo) {
    case 'Entrada':
      return 'positive'

    case 'Salida':
      return 'negative'

    case 'Devolución':
      return 'primary'

    case 'Ajuste':
      return 'orange'

    default:
      return 'grey'
  }
}

const colorIconoTipo = (tipo) => {
  switch (tipo) {
    case 'Entrada':
      return 'positive'

    case 'Salida':
      return 'negative'

    case 'Devolución':
      return 'primary'

    case 'Ajuste':
      return 'orange'

    default:
      return 'grey'
  }
}

const iconoTipo = (tipo) => {
  switch (tipo) {
    case 'Entrada':
      return 'south_west'

    case 'Salida':
      return 'north_east'

    case 'Devolución':
      return 'assignment_return'

    case 'Ajuste':
      return 'tune'

    default:
      return 'swap_vert'
  }
}

// ==============================
// FECHAS
// ==============================

const formatearFecha = (
  fecha,
) => {
  if (!fecha) {
    return '—'
  }

  const fechaConvertida =
    new Date(fecha)

  if (
    Number.isNaN(
      fechaConvertida.getTime(),
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(fechaConvertida)
}

const formatearFechaHora = (
  fecha,
) => {
  if (!fecha) {
    return '—'
  }

  const fechaConvertida =
    new Date(fecha)

  if (
    Number.isNaN(
      fechaConvertida.getTime(),
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(fechaConvertida)
}

// ==============================
// INICIO
// ==============================

onMounted(() => {
  cargarMovimientos()
})
const confirmarBorrarHistorial = async () => {
  if (!movimientos.value.length || cargando.value) return
  const confirmar = window.confirm(
    `Esta acción eliminará permanentemente ${movimientos.value.length} movimiento(s), incluidos los asociados a productos eliminados. No modifica las existencias actuales. ¿Deseas continuar?`,
  )
  if (!confirmar) return

  cargando.value = true
  try {
    const resultado = await api.eliminarHistorialMovimientos()
    movimientos.value = []
    $q.notify({
      type: 'positive',
      message: resultado.mensaje || `Historial borrado. Registros eliminados: ${resultado.eliminados ?? 0}.`,
    })
    await cargarMovimientos()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'No fue posible borrar el historial.' })
  } finally {
    cargando.value = false
  }
}

</script>

<style scoped>
.movimientos-page {
  padding: 28px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #1976d2;
  margin-bottom: 6px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.page-header p {
  margin: 6px 0 0;
  color: #6b7280;
  max-width: 760px;
}

.acciones-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.resumen-card {
  border-radius: 12px;
}

.resumen-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.resumen-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.resumen-total {
  background: #eaf2ff;
  color: #1976d2;
}

.resumen-entrada {
  background: #e7f7ee;
  color: #21a366;
}

.resumen-salida {
  background: #fff0f0;
  color: #d32f2f;
}

.resumen-devolucion {
  background: #e8f1ff;
  color: #1976d2;
}

.resumen-ajuste {
  background: #fff4df;
  color: #f57c00;
}

.resumen-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.resumen-info span {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.resumen-info strong {
  color: #1f2937;
  font-size: 25px;
  line-height: 1;
}

.filtros-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 240px auto;
  align-items: center;
  gap: 14px;
}

.tabla-card {
  border-radius: 12px;
  overflow: hidden;
}

.tabla-header {
  padding: 20px;
}

.tabla-header h2 {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 700;
  color: #1f2937;
}

.tabla-header span {
  color: #6b7280;
  font-size: 14px;
}

.producto-cell,
.usuario-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.producto-icono,
.avatar-usuario {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 10px;
  background: #eaf2ff;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-usuario {
  border-radius: 50%;
}

.producto-icono.grande,
.avatar-usuario.grande {
  width: 46px;
  height: 46px;
  min-width: 46px;
}

.nombre-producto,
.nombre-usuario {
  font-weight: 600;
  color: #1f2937;
}

.dato-secundario {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

.tipo-movimiento {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.cantidad {
  color: #1f2937;
  font-size: 16px;
}

.fecha-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  color: #4b5563;
  font-size: 13px;
}

.observacion-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280;
  font-size: 13px;
}

.acciones-cell {
  white-space: nowrap;
}

.dialogo-detalle,
.dialogo-registro {
  width: 100%;
  border-radius: 14px;
}

.dialogo-detalle {
  max-width: 760px;
}

.dialogo-registro {
  max-width: 700px;
}

.dialogo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
}

.dialogo-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.dialogo-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.detalle-contenido {
  max-height: 70vh;
  overflow-y: auto;
}

.detalle-tipo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 20px;
}

.detalle-tipo > span {
  color: #6b7280;
  font-size: 14px;
}

.detalle-seccion {
  padding: 20px 0;
}

.detalle-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1976d2;
  font-weight: 700;
}

.producto-detalle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.producto-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.producto-info strong {
  color: #1f2937;
  font-size: 15px;
}

.producto-info span {
  color: #6b7280;
  font-size: 12px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detalle-item span {
  color: #6b7280;
  font-size: 12px;
}

.detalle-item strong {
  color: #1f2937;
  font-size: 14px;
}

.responsable-detalle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.responsable-detalle > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.responsable-detalle strong {
  color: #1f2937;
}

.responsable-detalle span {
  color: #6b7280;
  font-size: 12px;
}

.observaciones {
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  color: #4b5563;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.campo-observacion {
  grid-column: 1 / -1;
}

.producto-seleccionado {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  background: #f8fbff;
}

.producto-seleccionado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.producto-seleccionado-header > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.producto-seleccionado-header span {
  color: #6b7280;
  font-size: 12px;
}

.producto-seleccionado-header strong {
  color: #1f2937;
  font-size: 15px;
}

.producto-seleccionado-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.producto-seleccionado-grid > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.producto-seleccionado-grid span {
  color: #6b7280;
  font-size: 11px;
}

.producto-seleccionado-grid strong {
  color: #1f2937;
  font-size: 13px;
}

.banner-aviso {
  margin-top: 16px;
  background: #f8fafc;
  color: #4b5563;
}

.dialogo-acciones {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .resumen-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filtros-grid {
    grid-template-columns: 1fr 220px;
  }

  .filtros-grid .q-btn {
    justify-self: start;
  }
}

@media (max-width: 800px) {
  .movimientos-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .acciones-header {
    width: 100%;
    flex-wrap: wrap;
  }

  .acciones-header .q-btn {
    flex: 1;
  }

  .resumen-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .detalle-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .campo-observacion {
    grid-column: auto;
  }

  .producto-seleccionado-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .acciones-header {
    flex-direction: column;
  }

  .acciones-header .q-btn {
    width: 100%;
  }

  .producto-seleccionado-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

</style>