<template>
  <div class="productos-page">

    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <div class="eyebrow">INVENTARIO</div>

        <h1>Productos</h1>

        <p>
          Consulta y gestión de los productos registrados en el inventario.
        </p>
      </div>

      <!-- BOTONES DEL ENCABEZADO -->
      <div class="acciones-header">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo producto"
          @click="abrirFormularioCrear"
        />

        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarProductos"
        />
      </div>
    </div>

    <!-- FILTROS -->
    <q-card flat bordered class="filtros-card">
      <q-card-section>
        <div class="row q-col-gutter-md">

          <div class="col-12 col-md-6">
            <q-input
              v-model="filtros.buscar"
              outlined
              dense
              clearable
              label="Buscar producto"
              placeholder="Código o nombre"
              @keyup.enter="cargarProductos"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.estado"
              outlined
              dense
              clearable
              label="Estado"
              :options="estados"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              class="full-width"
              color="primary"
              icon="search"
              label="Buscar"
              :loading="cargando"
              @click="cargarProductos"
            />
          </div>

        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card flat bordered class="tabla-card">

      <q-card-section class="tabla-header">
        <div>
          <h2>Listado de productos</h2>

          <span>
            {{ productos.length }} producto(s) encontrado(s)
          </span>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="productos"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay productos registrados"
        loading-label="Cargando productos..."
      >

        <!-- IMAGEN -->
        <template #body-cell-imagen="props">
          <q-td :props="props">

            <q-img
              v-if="props.row.imagenUrl"
              :src="resolverUrlImagen(props.row.imagenUrl)"
              width="55px"
              height="55px"
              fit="contain"
              class="imagen-producto"
            />

            <div
              v-else
              class="sin-imagen"
            >
              <q-icon
                name="image_not_supported"
                size="24px"
              />
            </div>

          </q-td>
        </template>

        <!-- CÓDIGO -->
        <template #body-cell-codigo="props">
          <q-td :props="props">
            <strong>
              {{ props.row.codigo || '—' }}
            </strong>
          </q-td>
        </template>

        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">

            <div class="nombre-producto">
              {{ props.row.nombre || '—' }}
            </div>

            <div class="descripcion-producto">
              {{ props.row.marca || 'Sin marca' }}

              <span v-if="props.row.modelo">
                · {{ props.row.modelo }}
              </span>
            </div>

          </q-td>
        </template>

        <!-- CATEGORÍA -->
        <template #body-cell-categoria="props">
          <q-td :props="props">
            {{ props.row.categoria?.nombre || 'Sin categoría' }}
          </q-td>
        </template>

        <!-- PRECIO -->
        <template #body-cell-precio="props">
          <q-td :props="props">
            {{ formatearPrecio(props.row.precio) }}
          </q-td>
        </template>

        <!-- STOCK -->
        <template #body-cell-stock="props">
          <q-td :props="props">

            <q-badge
              :color="colorStock(props.row)"
              :label="`${props.row.stock ?? 0} ${props.row.unidadMedida || 'unidad'}`"
            />
            <div v-if="props.row.unidadPresentacion && props.row.unidadPresentacion !== 'unidad'" class="text-caption text-grey-7">
              1 {{ props.row.unidadPresentacion }} = {{ props.row.cantidadPorPresentacion || 1 }} {{ props.row.unidadMedida || 'unidad' }}
            </div>

          </q-td>
        </template>

        <!-- ESTADO -->
        <template #body-cell-estado="props">
          <q-td :props="props">

            <q-badge
              :color="colorEstado(props.row.estado)"
              :label="props.row.estado || 'Sin estado'"
            />

          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-acciones="props">
          <q-td
            :props="props"
            class="acciones-producto"
          >

            <!-- EDITAR -->
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              :disable="guardandoProducto"
              @click="abrirFormularioEditar(props.row)"
            >
              <q-tooltip>
                Editar producto
              </q-tooltip>
            </q-btn>

            <!-- ELIMINAR -->
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="guardandoProducto || eliminandoProducto"
              @click="eliminarProducto(props.row)"
            >
              <q-tooltip>
                Eliminar producto
              </q-tooltip>
            </q-btn>

          </q-td>
        </template>

      </q-table>
    </q-card>

    <!-- ================================= -->
    <!-- FORMULARIO PRODUCTO -->
    <!-- ================================= -->

    <q-dialog
      v-model="dialogoProducto"
      persistent
      maximized
    >
      <q-card class="formulario-producto">

        <!-- ENCABEZADO DEL FORMULARIO -->
        <q-card-section class="formulario-header">

          <div>
            <div class="eyebrow">
              INVENTARIO
            </div>

            <h2>
              {{ modoEdicion ? 'Editar producto' : 'Nuevo producto' }}
            </h2>

            <p>
              {{
                modoEdicion
                  ? 'Modifica la información del producto y sus datos de inventario.'
                  : 'Registra la información del producto y sus datos de inventario.'
              }}
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="guardandoProducto"
            @click="cerrarFormulario"
          />

        </q-card-section>

        <q-separator />

        <!-- CONTENIDO -->
        <q-card-section class="formulario-contenido">

          <!-- INFORMACIÓN GENERAL -->
          <div class="seccion-formulario">

            <div class="titulo-seccion">
              Información general
            </div>

            <div class="row q-col-gutter-md">

              <!-- CÓDIGO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.codigo"
                  outlined
                  label="Código *"
                  maxlength="50"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- NOMBRE -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="nuevoProducto.nombre"
                  outlined
                  label="Nombre del producto *"
                  maxlength="150"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- DESCRIPCIÓN -->
              <div class="col-12">
                <q-input
                  v-model="nuevoProducto.descripcion"
                  outlined
                  type="textarea"
                  label="Descripción"
                  rows="3"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- CATEGORÍA -->
              <div class="col-12 col-md-4">
                <q-select
                  v-model="nuevoProducto.categoria"
                  outlined
                  label="Categoría *"
                  :options="categorias"
                  option-label="nombre"
                  option-value="_id"
                  emit-value
                  map-options
                  :loading="cargandoCategorias"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- MARCA -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.marca"
                  outlined
                  label="Marca"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- MODELO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.modelo"
                  outlined
                  label="Modelo"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- PRECIO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.precio"
                  outlined
                  type="number"
                  min="0"
                  label="Precio *"
                  prefix="$"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- STOCK -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.stock"
                  outlined
                  type="number"
                  min="0"
                  step="0.001"
                  :label="`Stock en ${nuevoProducto.unidadMedida} *`"
                  :disable="guardandoProducto"
                />
              </div>

              <div class="col-12 col-md-4 flex items-center">
                <q-checkbox
                  v-model="nuevoProducto.consumible"
                  label="Material consumible (sin límite de cotización)"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- STOCK MÍNIMO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.stockMinimo"
                  outlined
                  type="number"
                  min="0"
                  step="0.001"
                  :label="`Stock mínimo en ${nuevoProducto.unidadMedida} *`"
                  :disable="guardandoProducto"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="nuevoProducto.unidadMedida"
                  outlined
                  label="Unidad base del stock"
                  :options="[
                    { label: 'Unidad (und)', value: 'unidad' },
                    { label: 'Kilómetro (km)', value: 'km' },
                    { label: 'Hectómetro (hm)', value: 'hm' },
                    { label: 'Decámetro (dam)', value: 'dam' },
                    { label: 'Metro (m)', value: 'm' },
                    { label: 'Decímetro (dm)', value: 'dm' },
                    { label: 'Centímetro (cm)', value: 'cm' },
                    { label: 'Milímetro (mm)', value: 'mm' },
                    { label: 'Micrómetro (µm)', value: 'um' },
                    { label: 'Milla (mi)', value: 'mi' },
                    { label: 'Kilolitro (kL)', value: 'kL' },
                    { label: 'Hectolitro (hL)', value: 'hL' },
                    { label: 'Decalitro (daL)', value: 'daL' },
                    { label: 'Litro (L)', value: 'L' },
                    { label: 'Decilitro (dL)', value: 'dL' },
                    { label: 'Centilitro (cL)', value: 'cL' },
                    { label: 'Mililitro (mL)', value: 'mL' },
                    { label: 'Tonelada (t)', value: 't' },
                    { label: 'Kilogramo (kg)', value: 'kg' },
                    { label: 'Hectogramo (hg)', value: 'hg' },
                    { label: 'Decagramo (dag)', value: 'dag' },
                    { label: 'Gramo (g)', value: 'g' },
                    { label: 'Decigramo (dg)', value: 'dg' },
                    { label: 'Centigramo (cg)', value: 'cg' },
                    { label: 'Miligramo (mg)', value: 'mg' }
                  ]"
                  emit-value
                  map-options
                  :disable="guardandoProducto"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.unidadPresentacion"
                  outlined
                  label="Presentación (ej. carrete)"
                  hint="Opcional"
                  :disable="guardandoProducto"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.cantidadPorPresentacion"
                  outlined
                  type="number"
                  min="0.000001"
                  step="0.001"
                  :label="`Cantidad por presentación (${nuevoProducto.unidadMedida})`"
                  hint="Ej.: un carrete contiene 100 metros"
                  :disable="guardandoProducto"
                />
              </div>

              <div class="col-12">
                <q-banner rounded class="bg-blue-1 text-primary">
                  El stock y los movimientos se guardan en la unidad base. Ejemplo: para un carrete de 100 m, registra stock 100, unidad base m, presentación carrete y equivalencia 100. Si prestas 3 m, el stock baja a 97 m.
                </q-banner>
              </div>

              <!-- ESTADO -->
              <div class="col-12 col-md-4">
                <q-select
                  v-model="nuevoProducto.estado"
                  outlined
                  label="Estado"
                  :options="estados"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- IMAGEN: URL, archivo local o cámara del teléfono -->
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Imagen del producto</div>
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-md-7">
                    <q-input
                      v-model="nuevoProducto.imagenUrl"
                      outlined
                      label="URL de imagen (opcional)"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      :disable="guardandoProducto || Boolean(archivoImagenSeleccionado)"
                    >
                      <template #prepend><q-icon name="link" /></template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-5 row q-gutter-sm">
                    <q-btn
                      outline color="primary" icon="upload_file" label="Elegir imagen"
                      :disable="guardandoProducto" @click="$refs.archivoImagenInput.click()"
                    />
                    <q-btn
                      outline color="secondary" icon="photo_camera" label="Tomar foto"
                      :disable="guardandoProducto" @click="$refs.camaraImagenInput.click()"
                    />
                  </div>
                </div>
                <input
                  ref="archivoImagenInput" type="file" accept="image/jpeg,image/png,image/webp"
                  class="imagen-input-oculto" @change="seleccionarImagen"
                />
                <input
                  ref="camaraImagenInput" type="file" accept="image/*" capture="environment"
                  class="imagen-input-oculto" @change="seleccionarImagen"
                />
                <div v-if="imagenPreview || nuevoProducto.imagenUrl" class="row items-center q-gutter-md q-mt-sm">
                  <img :src="imagenPreview || resolverUrlImagen(nuevoProducto.imagenUrl)" alt="Vista previa de la imagen del producto" class="imagen-vista-previa" />
                  <div class="column q-gutter-xs">
                    <span class="text-caption">{{ archivoImagenSeleccionado?.name || 'Imagen actual' }}</span>
                    <q-btn v-if="archivoImagenSeleccionado" flat dense color="negative" icon="close" label="Quitar selección" :disable="guardandoProducto" @click="limpiarImagenSeleccionada" />
                    <q-btn v-else-if="nuevoProducto.imagenUrl.startsWith('/productos/')" flat dense color="negative" icon="delete_outline" label="Quitar imagen guardada" :disable="guardandoProducto" @click="quitarImagenGuardada" />
                  </div>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">JPG, PNG o WEBP. La imagen se optimiza y guarda en la base de datos para conservarse después de los despliegues.</div>
              </div>

            </div>
          </div>



        </q-card-section>

        <q-separator />

        <!-- BOTONES -->
        <q-card-actions
          align="right"
          class="formulario-acciones"
        >
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            :disable="guardandoProducto"
            @click="cerrarFormulario"
          />

          <q-btn
            color="primary"
            icon="save"
            :label="modoEdicion ? 'Guardar cambios' : 'Guardar producto'"
            :loading="guardandoProducto"
            @click="guardarProducto"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- ================================= -->
    <!-- CONFIRMAR ELIMINACIÓN -->
    <!-- ================================= -->

    <q-dialog
      v-model="dialogoEliminar"
      persistent
    >
      <q-card class="dialogo-eliminar">

        <!-- ENCABEZADO -->
        <q-card-section class="dialogo-eliminar-header">

          <div class="icono-eliminar">
            <q-icon
              name="delete_outline"
              size="32px"
            />
          </div>

          <div>
            <div class="titulo-eliminar">
              Eliminar producto
            </div>

            <div class="subtitulo-eliminar">
              Esta acción no se puede deshacer.
            </div>
          </div>

        </q-card-section>

        <!-- CONTENIDO -->
        <q-card-section class="dialogo-eliminar-contenido">

          <p>
            ¿Estás seguro de que deseas eliminar este producto?
          </p>

          <div
            v-if="productoAEliminar"
            class="producto-a-eliminar"
          >

            <div class="producto-eliminar-icono">
              <q-icon
                name="inventory_2"
                size="26px"
              />
            </div>

            <div>
              <div class="producto-eliminar-nombre">
                {{ productoAEliminar.nombre }}
              </div>

              <div class="producto-eliminar-codigo">
                Código:
                {{ productoAEliminar.codigo || 'Sin código' }}
              </div>
            </div>

          </div>

        </q-card-section>

        <q-separator />

        <!-- BOTONES -->
        <q-card-actions
          align="right"
          class="dialogo-eliminar-acciones"
        >

          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            :disable="eliminandoProducto"
            @click="cancelarEliminar"
          />

          <q-btn
            unelevated
            label="Eliminar producto"
            icon="delete"
            color="negative"
            :loading="eliminandoProducto"
            @click="confirmarEliminar"
          />

        </q-card-actions>

      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import api, { resolverUrlImagen } from '../services/api'

const $q = useQuasar()
const route = useRoute()

const archivoImagenSeleccionado = ref(null)
const imagenPreview = ref('')

const limpiarImagenSeleccionada = () => {
  if (imagenPreview.value.startsWith('blob:')) URL.revokeObjectURL(imagenPreview.value)
  imagenPreview.value = ''
  archivoImagenSeleccionado.value = null
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.imagen-input-oculto').forEach((input) => { input.value = '' })
  }
}

const seleccionarImagen = (evento) => {
  const archivo = evento.target.files?.[0]
  if (!archivo) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
    $q.notify({ type: 'warning', message: 'Selecciona una imagen JPG, PNG o WEBP.' })
    evento.target.value = ''
    return
  }
  if (archivo.size > 12 * 1024 * 1024) {
    $q.notify({ type: 'warning', message: 'La imagen original debe pesar menos de 12 MB.' })
    evento.target.value = ''
    return
  }
  limpiarImagenSeleccionada()
  archivoImagenSeleccionado.value = archivo
  imagenPreview.value = URL.createObjectURL(archivo)
}

const convertirImagenOptimizada = (archivo) => new Promise((resolve, reject) => {
  const lector = new FileReader()
  lector.onerror = () => reject(new Error('No fue posible leer la imagen seleccionada.'))
  lector.onload = () => {
    const imagen = new Image()
    imagen.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'))
    imagen.onload = () => {
      const maximo = 1400
      const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(imagen.width * escala))
      canvas.height = Math.max(1, Math.round(imagen.height * escala))
      const contexto = canvas.getContext('2d')
      if (!contexto) return reject(new Error('No fue posible optimizar la imagen.'))
      contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)
      const resultado = canvas.toDataURL('image/jpeg', 0.82)
      const bytes = Math.ceil((resultado.length - resultado.indexOf(',') - 1) * 3 / 4)
      if (bytes > 2 * 1024 * 1024) return reject(new Error('La imagen optimizada supera 2 MB. Elige una imagen más pequeña.'))
      resolve(resultado)
    }
    imagen.src = lector.result
  }
  lector.readAsDataURL(archivo)
})

const quitarImagenGuardada = async () => {
  if (!modoEdicion.value || !productoEditandoId.value) {
    nuevoProducto.imagenUrl = ''
    return
  }
  try {
    await api.eliminarImagenProducto(productoEditandoId.value)
    nuevoProducto.imagenUrl = ''
    $q.notify({ type: 'positive', message: 'Imagen eliminada.' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'No fue posible quitar la imagen.' })
  }
}

const productos = ref([])
const cargando = ref(false)

const filtros = reactive({
  buscar: '',
  estado: '',
  filtro: '',
})

const estados = [
  'Disponible',
  'Prestado',
  'Mantenimiento',
  'Dañado',
  'Retirado',
]

const columnas = [
  {
    name: 'imagen',
    label: 'IMAGEN',
    field: 'imagenUrl',
    align: 'center',
  },
  {
    name: 'codigo',
    label: 'CÓDIGO',
    field: 'codigo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'PRODUCTO',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'categoria',
    label: 'CATEGORÍA',
    field: row => row.categoria?.nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'precio',
    label: 'PRECIO',
    field: 'precio',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stock',
    label: 'STOCK',
    field: 'stock',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'ESTADO',
    field: 'estado',
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
// FORMULARIO PRODUCTO
// ============================================

const dialogoProducto = ref(false)
const guardandoProducto = ref(false)
const cargandoCategorias = ref(false)
const categorias = ref([])
const modoEdicion = ref(false)
const productoEditandoId = ref(null)

// ============================================
// ELIMINAR PRODUCTO
// ============================================

const dialogoEliminar = ref(false)
const productoAEliminar = ref(null)
const eliminandoProducto = ref(false)

const crearProductoVacio = () => ({
  codigo: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  marca: '',
  modelo: '',
  precio: 0,
  stock: 0,
  stockMinimo: 0,
  consumible: false,
  unidadMedida: 'unidad',
  unidadPresentacion: 'unidad',
  cantidadPorPresentacion: 1,
  estado: 'Disponible',
  imagenUrl: '',
})

const nuevoProducto = reactive(crearProductoVacio())

// ============================================
// CATEGORÍAS
// ============================================

const cargarCategorias = async () => {
  cargandoCategorias.value = true

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
    cargandoCategorias.value = false
  }
}

// ============================================
// FORMULARIO
// ============================================

const limpiarFormulario = () => {
  limpiarImagenSeleccionada()
  Object.assign(
    nuevoProducto,
    crearProductoVacio(),
  )

  productoEditandoId.value = null
  modoEdicion.value = false
}

const abrirFormularioCrear = async () => {
  limpiarFormulario()

  dialogoProducto.value = true

  if (categorias.value.length === 0) {
    await cargarCategorias()
  }
}

const abrirFormularioEditar = async (producto) => {
  limpiarFormulario()

  modoEdicion.value = true
  productoEditandoId.value = producto._id

  nuevoProducto.codigo = producto.codigo || ''
  nuevoProducto.nombre = producto.nombre || ''
  nuevoProducto.descripcion = producto.descripcion || ''

  nuevoProducto.categoria =
    producto.categoria?._id ||
    producto.categoria ||
    ''

  nuevoProducto.marca = producto.marca || ''
  nuevoProducto.modelo = producto.modelo || ''

  nuevoProducto.precio =
    Number(producto.precio || 0)

  nuevoProducto.stock =
    Number(producto.stock || 0)

  nuevoProducto.stockMinimo =
    Number(producto.stockMinimo || 0)

  nuevoProducto.unidadMedida = producto.unidadMedida || 'unidad'
  nuevoProducto.consumible = Boolean(producto.consumible)
  nuevoProducto.unidadPresentacion = producto.unidadPresentacion || 'unidad'
  nuevoProducto.cantidadPorPresentacion = Number(producto.cantidadPorPresentacion || 1)

  nuevoProducto.estado =
    producto.estado || 'Disponible'

  nuevoProducto.imagenUrl =
    producto.imagenUrl || ''



  dialogoProducto.value = true

  if (categorias.value.length === 0) {
    await cargarCategorias()
  }
}

const cerrarFormulario = () => {
  if (guardandoProducto.value) {
    return
  }

  dialogoProducto.value = false
}

const guardarProducto = async () => {

  if (!nuevoProducto.codigo.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El código del producto es obligatorio.',
    })

    return
  }

  if (!nuevoProducto.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del producto es obligatorio.',
    })

    return
  }

  if (!nuevoProducto.categoria) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar una categoría.',
    })

    return
  }

  if (
    nuevoProducto.precio === '' ||
    nuevoProducto.precio === null ||
    Number(nuevoProducto.precio) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser un valor válido.',
    })

    return
  }

  if (
    nuevoProducto.stock === '' ||
    nuevoProducto.stock === null ||
    Number(nuevoProducto.stock) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El stock debe ser un valor válido.',
    })

    return
  }

  if (
    nuevoProducto.stockMinimo === '' ||
    nuevoProducto.stockMinimo === null ||
    Number(nuevoProducto.stockMinimo) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El stock mínimo debe ser un valor válido.',
    })

    return
  }

  guardandoProducto.value = true

  const datosProducto = {
    codigo: nuevoProducto.codigo,
    nombre: nuevoProducto.nombre,
    descripcion: nuevoProducto.descripcion,
    categoria: nuevoProducto.categoria,
    marca: nuevoProducto.marca,
    modelo: nuevoProducto.modelo,
    precio: Number(nuevoProducto.precio),
    stock: Number(nuevoProducto.stock),
    consumible: Boolean(nuevoProducto.consumible),
    stockMinimo: Number(nuevoProducto.stockMinimo),
    unidadMedida: nuevoProducto.unidadMedida || 'unidad',
    unidadPresentacion: nuevoProducto.unidadPresentacion || 'unidad',
    cantidadPorPresentacion: Number(nuevoProducto.cantidadPorPresentacion || 1),
    estado: nuevoProducto.estado,
    imagenUrl: nuevoProducto.imagenUrl,
  }

  try {

    let productoGuardado
    if (modoEdicion.value) {
      productoGuardado = await api.actualizarProducto(
        productoEditandoId.value,
        datosProducto,
      )
    } else {
      productoGuardado = await api.crearProducto(datosProducto)
    }

    if (archivoImagenSeleccionado.value) {
      const imagenOptimizada = await convertirImagenOptimizada(archivoImagenSeleccionado.value)
      await api.subirImagenProducto(productoGuardado._id, imagenOptimizada)
    }

    $q.notify({
      type: 'positive',
      message: modoEdicion.value
        ? 'Producto actualizado correctamente.'
        : 'Producto creado correctamente.',
    })

    dialogoProducto.value = false

    limpiarFormulario()

    await cargarProductos()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        (
          modoEdicion.value
            ? 'No fue posible actualizar el producto.'
            : 'No fue posible crear el producto.'
        ),
    })

  } finally {
    guardandoProducto.value = false
  }
}

// ============================================
// PRODUCTOS
// ============================================

const cargarProductos = async () => {
  cargando.value = true

  try {

    productos.value = await api.obtenerProductos({
      buscar: filtros.buscar,
      estado: filtros.estado,
      filtro: filtros.filtro,
    })

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar los productos.',
    })

  } finally {
    cargando.value = false
  }
}

// ============================================
// ELIMINACIÓN
// ============================================

const eliminarProducto = (producto) => {
  productoAEliminar.value = producto
  dialogoEliminar.value = true
}

const cancelarEliminar = () => {

  if (eliminandoProducto.value) {
    return
  }

  dialogoEliminar.value = false
  productoAEliminar.value = null
}

const confirmarEliminar = async () => {

  if (!productoAEliminar.value) {
    return
  }

  eliminandoProducto.value = true

  try {

    await api.eliminarProducto(
      productoAEliminar.value._id,
    )

    dialogoEliminar.value = false
    productoAEliminar.value = null

    $q.notify({
      type: 'positive',
      message: 'Producto eliminado correctamente.',
    })

    await cargarProductos()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible eliminar el producto.',
    })

  } finally {
    eliminandoProducto.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================

const formatearPrecio = (valor) => {

  const numero = Number(valor || 0)

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(numero)
}

const colorStock = (producto) => {

  const stock = Number(producto.stock || 0)
  const minimo = Number(producto.stockMinimo || 0)

  if (stock === 0) {
    return 'negative'
  }

  if (stock <= minimo) {
    return 'warning'
  }

  return 'positive'
}

const colorEstado = (estado) => {

  switch (estado) {

    case 'Disponible':
      return 'positive'

    case 'Prestado':
      return 'primary'

    case 'Mantenimiento':
      return 'warning'

    case 'Dañado':
      return 'negative'

    case 'Retirado':
      return 'grey'

    default:
      return 'grey'
  }
}

const aplicarFiltroDeRuta = () => {
  const filtro = String(route.query.filtro || '')
  filtros.filtro = ''
  filtros.estado = ''
  if (filtro === 'disponibles') filtros.estado = 'Disponible'
  else if (filtro === 'prestados') filtros.estado = 'Prestado'
  else if (filtro === 'stockBajo' || filtro === 'atencion') filtros.filtro = filtro
}

onMounted(() => {
  aplicarFiltroDeRuta()
  cargarProductos()
})

watch(() => route.query.filtro, async () => {
  aplicarFiltroDeRuta()
  await cargarProductos()
})
</script>

<style scoped>
.productos-page {
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

.filtros-card {
  margin-bottom: 24px;
  border-radius: 12px;
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
}

.tabla-header span {
  color: #6b7280;
  font-size: 14px;
}

.nombre-producto {
  font-weight: 600;
}

.descripcion-producto {
  margin-top: 3px;
  color: #7a7a7a;
  font-size: 12px;
}

.imagen-producto {
  border-radius: 8px;
  background: #f5f5f5;
}

.sin-imagen {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f5f5;
  color: #9e9e9e;
}

.acciones-producto {
  white-space: nowrap;
}

/* ==========================================
   FORMULARIO
   ========================================== */

.formulario-producto {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}

.formulario-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 28px 32px;
  background: #ffffff;
}

.formulario-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.formulario-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.formulario-contenido {
  padding: 30px 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.seccion-formulario {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.titulo-seccion {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 22px;
  color: #1f2937;
}

.formulario-acciones {
  padding: 18px 32px;
  background: #ffffff;
}

/* ==========================================
   DIÁLOGO ELIMINAR PRODUCTO
   ========================================== */

.dialogo-eliminar {
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
}

.dialogo-eliminar-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 18px;
}

.icono-eliminar {
  width: 56px;
  height: 56px;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #fee2e2;
  color: #dc2626;
}

.titulo-eliminar {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.subtitulo-eliminar {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.dialogo-eliminar-contenido {
  padding: 10px 24px 24px;
}

.dialogo-eliminar-contenido p {
  margin: 0 0 16px;
  color: #4b5563;
  font-size: 15px;
}

.producto-a-eliminar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.producto-eliminar-icono {
  width: 46px;
  height: 46px;
  min-width: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #ffffff;
  color: #6b7280;
}

.producto-eliminar-nombre {
  font-weight: 700;
  color: #1f2937;
}

.producto-eliminar-codigo {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.dialogo-eliminar-acciones {
  padding: 16px 24px;
  background: #ffffff;
}

@media (max-width: 700px) {

  .productos-page {
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

  .formulario-header {
    padding: 20px;
  }

  .formulario-contenido {
    padding: 20px 16px;
  }

  .seccion-formulario {
    padding: 18px;
  }

  .formulario-acciones {
    padding: 16px;
  }

  .dialogo-eliminar {
    max-width: calc(100vw - 32px);
  }

  .dialogo-eliminar-header {
    padding: 20px 18px 14px;
  }

  .dialogo-eliminar-contenido {
    padding: 10px 18px 20px;
  }

  .dialogo-eliminar-acciones {
    padding: 14px 18px;
  }
}

.imagen-input-oculto {
  display: none;
}

.imagen-vista-previa {
  width: 96px;
  height: 96px;
  object-fit: contain;
  border: 1px solid #dce3ed;
  border-radius: 10px;
  background: #fff;
}

</style>
