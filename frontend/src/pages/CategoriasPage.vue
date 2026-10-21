<template>
  <div class="categorias-page">
    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <div class="eyebrow">INVENTARIO</div>

        <h1>Categorías</h1>

        <p>
          Administra las categorías utilizadas para organizar los productos
          del inventario.
        </p>
      </div>

      <div class="acciones-header">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva categoría"
          @click="abrirFormularioCrear"
        />

        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarCategorias"
        />
      </div>
    </div>

    <!-- RESUMEN -->
    <div class="resumen-grid">
      <q-card
        flat
        bordered
        class="resumen-card"
      >
        <q-card-section>
          <div class="resumen-icon">
            <q-icon
              name="category"
              size="28px"
            />
          </div>

          <div class="resumen-info">
            <span>Total categorías</span>

            <strong>
              {{ categorias.length }}
            </strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card
        flat
        bordered
        class="resumen-card"
      >
        <q-card-section>
          <div class="resumen-icon">
            <q-icon
              name="check_circle"
              size="28px"
            />
          </div>

          <div class="resumen-info">
            <span>Categorías activas</span>

            <strong>
              {{ categoriasActivas }}
            </strong>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- TABLA -->
    <q-card
      flat
      bordered
      class="tabla-card"
    >
      <q-card-section class="tabla-header">
        <div>
          <h2>Listado de categorías</h2>

          <span>
            {{ categorias.length }} categoría(s) registrada(s)
          </span>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="categorias"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay categorías registradas"
        loading-label="Cargando categorías..."
      >
        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">
            <div class="nombre-categoria">
              {{ props.row.nombre }}
            </div>
          </q-td>
        </template>

        <!-- DESCRIPCIÓN -->
        <template #body-cell-descripcion="props">
          <q-td :props="props">
            <span class="descripcion-categoria">
              {{ props.row.descripcion || 'Sin descripción' }}
            </span>
          </q-td>
        </template>

        <!-- ESTADO -->
        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.activo ? 'positive' : 'grey'"
              :label="props.row.activo ? 'Activa' : 'Inactiva'"
            />
          </q-td>
        </template>

        <!-- FECHA -->
        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatearFecha(props.row.createdAt) }}
          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-acciones="props">
          <q-td
            :props="props"
            class="acciones-categoria"
          >
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              :disable="guardandoCategoria"
              @click="abrirFormularioEditar(props.row)"
            >
              <q-tooltip>
                Editar categoría
              </q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="guardandoCategoria"
              @click="confirmarEliminarCategoria(props.row)"
            >
              <q-tooltip>Eliminar categoría</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================================= -->
    <!-- FORMULARIO -->
    <!-- ================================= -->

    <q-dialog
      v-model="dialogoCategoria"
      persistent
    >
      <q-card class="dialogo-categoria">
        <!-- ENCABEZADO -->
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">
              CATEGORÍAS
            </div>

            <h2>
              {{
                modoEdicion
                  ? 'Editar categoría'
                  : 'Nueva categoría'
              }}
            </h2>

            <p>
              {{
                modoEdicion
                  ? 'Modifica la información de la categoría.'
                  : 'Registra una nueva categoría para el inventario.'
              }}
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="guardandoCategoria"
            @click="cerrarFormulario"
          />
        </q-card-section>

        <q-separator />

        <!-- FORMULARIO -->
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="formulario.nombre"
                outlined
                label="Nombre de la categoría *"
                maxlength="100"
                :disable="guardandoCategoria"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="formulario.descripcion"
                outlined
                type="textarea"
                label="Descripción"
                rows="4"
                maxlength="500"
                :disable="guardandoCategoria"
              />
            </div>

            <!-- ESTADO SOLO EN EDICIÓN -->
            <div
              v-if="modoEdicion"
              class="col-12"
            >
              <q-toggle
                v-model="formulario.activo"
                color="primary"
                label="Categoría activa"
                :disable="guardandoCategoria"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- ACCIONES -->
        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >
          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="guardandoCategoria"
            @click="cerrarFormulario"
          />

          <q-btn
            color="primary"
            icon="save"
            :label="
              modoEdicion
                ? 'Guardar cambios'
                : 'Guardar categoría'
            "
            :loading="guardandoCategoria"
            @click="guardarCategoria"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmacionEliminarAbierta" persistent>
      <q-card style="width: 440px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon name="warning" color="negative" size="32px" />
          <div class="text-h6">Eliminar categoría</div>
        </q-card-section>
        <q-card-section>
          ¿Seguro que deseas eliminar <strong>{{ categoriaParaEliminar?.nombre }}</strong>?
          Solo se eliminará si no tiene productos asociados.
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" :disable="eliminandoCategoria" @click="confirmacionEliminarAbierta = false" />
          <q-btn color="negative" icon="delete" label="Eliminar" :loading="eliminandoCategoria" @click="ejecutarEliminarCategoria" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()

// ============================================
// ESTADO
// ============================================

const categorias = ref([])
const cargando = ref(false)

const dialogoCategoria = ref(false)
const guardandoCategoria = ref(false)
const confirmacionEliminarAbierta = ref(false)
const eliminandoCategoria = ref(false)
const categoriaParaEliminar = ref(null)

const modoEdicion = ref(false)
const categoriaEditandoId = ref(null)

// ============================================
// TABLA
// ============================================

const columnas = [
  {
    name: 'nombre',
    label: 'NOMBRE',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'DESCRIPCIÓN',
    field: 'descripcion',
    align: 'left',
  },
  {
    name: 'activo',
    label: 'ESTADO',
    field: 'activo',
    align: 'center',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'FECHA DE REGISTRO',
    field: 'createdAt',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    field: '_id',
    align: 'center',
  },
]

// ============================================
// FORMULARIO
// ============================================

const crearFormularioVacio = () => ({
  nombre: '',
  descripcion: '',
  activo: true,
})

const formulario = reactive(
  crearFormularioVacio(),
)

// ============================================
// CATEGORÍAS ACTIVAS
// ============================================

const categoriasActivas = computed(() => {
  return categorias.value.filter(
    (categoria) => categoria.activo !== false,
  ).length
})

// ============================================
// CARGAR CATEGORÍAS
// ============================================

const cargarCategorias = async () => {
  cargando.value = true

  try {
    categorias.value = await api.obtenerCategorias()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar las categorías.',
    })
  } finally {
    cargando.value = false
  }
}

// ============================================
// FORMULARIO CREAR
// ============================================

const limpiarFormulario = () => {
  Object.assign(
    formulario,
    crearFormularioVacio(),
  )

  modoEdicion.value = false
  categoriaEditandoId.value = null
}

const abrirFormularioCrear = () => {
  limpiarFormulario()

  dialogoCategoria.value = true
}

// ============================================
// FORMULARIO EDITAR
// ============================================

const abrirFormularioEditar = (categoria) => {
  formulario.nombre = categoria.nombre || ''

  formulario.descripcion =
    categoria.descripcion || ''

  formulario.activo =
    categoria.activo !== false

  modoEdicion.value = true
  categoriaEditandoId.value = categoria._id

  dialogoCategoria.value = true
}

// ============================================
// CERRAR FORMULARIO
// ============================================

const cerrarFormulario = () => {
  if (guardandoCategoria.value) {
    return
  }

  dialogoCategoria.value = false
}

// ============================================
// GUARDAR
// ============================================

const guardarCategoria = async () => {
  if (!formulario.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message:
        'El nombre de la categoría es obligatorio.',
    })

    return
  }

  guardandoCategoria.value = true

  try {
    if (modoEdicion.value) {
      await api.actualizarCategoria(
        categoriaEditandoId.value,
        {
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          activo: formulario.activo,
        },
      )

      $q.notify({
        type: 'positive',
        message:
          'Categoría actualizada correctamente.',
      })
    } else {
      await api.crearCategoria({
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
      })

      $q.notify({
        type: 'positive',
        message:
          'Categoría creada correctamente.',
      })
    }

    dialogoCategoria.value = false

    limpiarFormulario()

    await cargarCategorias()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        (
          modoEdicion.value
            ? 'No fue posible actualizar la categoría.'
            : 'No fue posible crear la categoría.'
        ),
    })
  } finally {
    guardandoCategoria.value = false
  }
}

const confirmarEliminarCategoria = (categoria) => {
  categoriaParaEliminar.value = categoria
  confirmacionEliminarAbierta.value = true
}

const ejecutarEliminarCategoria = async () => {
  if (!categoriaParaEliminar.value?._id) return
  eliminandoCategoria.value = true
  try {
    await api.eliminarCategoria(categoriaParaEliminar.value._id)
    $q.notify({ type: 'positive', message: 'Categoría eliminada correctamente.' })
    confirmacionEliminarAbierta.value = false
    categoriaParaEliminar.value = null
    await cargarCategorias()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'No fue posible eliminar la categoría.' })
  } finally {
    eliminandoCategoria.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================

const formatearFecha = (fecha) => {
  if (!fecha) {
    return '—'
  }

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
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

// ============================================
// INICIO
// ============================================

onMounted(() => {
  cargarCategorias()
})
</script>

<style scoped>
.categorias-page {
  padding: 28px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.acciones-header {
  display: flex;
  align-items: center;
  gap: 10px;
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
}

.page-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

/* ==========================================
   RESUMEN
   ========================================== */

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.resumen-card {
  border-radius: 12px;
}

.resumen-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.resumen-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #eaf2ff;
  color: #1976d2;
}

.resumen-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resumen-info span {
  color: #6b7280;
  font-size: 14px;
}

.resumen-info strong {
  color: #1f2937;
  font-size: 26px;
  line-height: 1;
}

/* ==========================================
   TABLA
   ========================================== */

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
}

.tabla-header span {
  color: #6b7280;
  font-size: 14px;
}

.nombre-categoria {
  font-weight: 600;
  color: #1f2937;
}

.descripcion-categoria {
  color: #6b7280;
}

.acciones-categoria {
  white-space: nowrap;
}

/* ==========================================
   DIÁLOGO
   ========================================== */

.dialogo-categoria {
  width: 100%;
  max-width: 560px;
  border-radius: 14px;
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
}

.dialogo-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.dialogo-acciones {
  padding: 16px 20px;
}

@media (max-width: 700px) {
  .categorias-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .acciones-header {
    width: 100%;
    flex-direction: column;
  }

  .acciones-header .q-btn {
    width: 100%;
  }

  .resumen-grid {
    grid-template-columns: 1fr;
  }
}
</style>