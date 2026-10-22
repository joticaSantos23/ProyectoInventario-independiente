
<template>
  <div class="prestamos-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">GESTIÓN DE INVENTARIO</div>
        <h1>Préstamos</h1>
        <p>Administra las solicitudes, aprobaciones, entregas y devoluciones de equipos del inventario.</p>
      </div>

      <div class="acciones-header">
        <q-btn
          color="primary"
          icon="add"
          label="Registrar préstamo"
          :disable="procesando"
          @click="abrirFormularioPrestamo"
        />
        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarPrestamos"
        />
      </div>
    </div>

    <!-- RESUMEN -->
    <div class="resumen-grid">
      <q-card v-for="resumen in resumenes" :key="resumen.estado" flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon" :class="resumen.clase">
            <q-icon :name="resumen.icono" size="28px" />
          </div>
          <div class="resumen-info">
            <span>{{ resumen.titulo }}</span>
            <strong>{{ resumen.estado ? cantidadPorEstado(resumen.estado) : prestamos.length }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- FILTROS -->
    <q-card flat bordered class="filtros-card">
      <q-card-section>
        <div class="filtros-grid">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            label="Buscar préstamo"
            placeholder="Nombre, identificación o correo"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroEstado"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Estado"
            :options="opcionesEstado"
          />

          <q-btn
            flat
            color="primary"
            icon="filter_alt_off"
            label="Limpiar filtros"
            :disable="!busqueda && !filtroEstado"
            @click="limpiarFiltros"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card flat bordered class="tabla-card">
      <q-card-section class="tabla-header">
        <h2>Solicitudes de préstamo</h2>
        <span>{{ prestamosFiltrados.length }} préstamo(s) mostrado(s)</span>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="prestamosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay préstamos registrados"
        loading-label="Cargando préstamos..."
        :rows-per-page-options="[10, 20, 50, 0]"
      >
        <template #body-cell-solicitante="props">
          <q-td :props="props">
            <div class="solicitante-cell">
              <div class="avatar-solicitante">
                <q-icon name="person" size="20px" />
              </div>
              <div>
                <div class="nombre-solicitante">
                  {{ props.row.nombreSolicitante || 'Sin nombre' }}
                </div>
                <div class="dato-secundario">
                  {{ props.row.identificacion || 'Sin identificación' }}
                </div>
                <div class="dato-secundario">
                  {{ tipoPersonaTexto(props.row.tipoPersona) }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-contacto="props">
          <q-td :props="props">
            <div class="contacto-cell">
              <span>
                <q-icon name="mail" size="15px" />
                {{ props.row.correo || 'Sin correo' }}
              </span>
              <span>
                <q-icon name="phone" size="15px" />
                {{ props.row.telefono || 'Sin teléfono' }}
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-productos="props">
          <q-td :props="props">
            <div class="productos-cell">
              <q-badge
                color="blue-1"
                text-color="primary"
                :label="`${cantidadProductos(props.row)} producto(s)`"
              />
              <div
                v-for="item in productosVisibles(props.row)"
                :key="item.producto?._id || item._id"
                class="producto-resumen"
              >
                <span>{{ item.producto?.nombre || 'Producto no disponible' }}</span>
                <strong>× {{ item.cantidad }} {{ item.producto?.unidadMedida || 'unidad' }}</strong>
              </div>
              <span v-if="cantidadProductos(props.row) > 2" class="mas-productos">
                +{{ cantidadProductos(props.row) - 2 }} más
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-fechaDevolucionPrevista="props">
          <q-td :props="props">
            {{ formatearFecha(props.row.fechaDevolucionPrevista) }}
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              rounded
              class="estado-badge"
              :color="colorEstado(props.row.estado)"
              :label="props.row.estado"
            />
          </q-td>
        </template>

        <template #body-cell-fechaSolicitud="props">
          <q-td :props="props">
            {{ formatearFecha(props.row.fechaSolicitud || props.row.createdAt) }}
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props" class="acciones-cell">
            <div class="acciones-tabla">
              <q-btn flat round dense color="primary" icon="visibility" @click="verDetalle(props.row)">
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.estado === 'Pendiente'"
                flat round dense color="positive" icon="check"
                :disable="procesando"
                @click="confirmarAprobacion(props.row)"
              >
                <q-tooltip>Aprobar préstamo</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.estado === 'Pendiente'"
                flat round dense color="negative" icon="close"
                :disable="procesando"
                @click="abrirRechazo(props.row)"
              >
                <q-tooltip>Rechazar préstamo</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.estado === 'Aprobado'"
                flat round dense color="primary" icon="local_shipping"
                :disable="procesando"
                @click="confirmarEntrega(props.row)"
              >
                <q-tooltip>Registrar entrega</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.estado === 'Entregado'"
                flat round dense color="orange" icon="assignment_return"
                :disable="procesando"
                @click="confirmarDevolucion(props.row)"
              >
                <q-tooltip>Registrar devolución</q-tooltip>
              </q-btn>

              <q-btn
                v-if="['Rechazado', 'Devuelto'].includes(props.row.estado)"
                flat round dense color="negative" icon="delete"
                :disable="procesando"
                @click="confirmarEliminacion(props.row)"
              >
                <q-tooltip>Eliminar solicitud</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- REGISTRAR PRÉSTAMO ADMINISTRATIVO -->
    <q-dialog v-model="dialogoCrearPrestamo" persistent>
      <q-card class="dialogo-crear-prestamo">
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">GESTIÓN DE INVENTARIO</div>
            <h2>Registrar préstamo</h2>
            <p>Registra la entrega de equipos a una persona.</p>
          </div>
          <q-btn
            flat round dense icon="close"
            :disable="procesando"
            @click="cerrarFormularioPrestamo"
          />
        </q-card-section>

        <q-separator />

        <q-form @submit.prevent="crearPrestamoAdministrativo">
          <q-card-section class="formulario-prestamo">
            <div class="formulario-nota">
              <q-icon name="info" size="20px" />
              <span>
                El préstamo quedará registrado como entregado. El backend debe actualizar el inventario y registrar los movimientos correspondientes.
              </span>
            </div>

            <div class="formulario-seccion-titulo">Datos de la persona</div>

            <q-select
              v-model="nuevoPrestamo.tipoPersona"
              outlined
              emit-value
              map-options
              label="Tipo de persona *"
              :options="opcionesTipoPersona"
              :disable="procesando"
              :rules="[v => !!v || 'Selecciona el tipo de persona']"
            />

            <q-input
              v-model="nuevoPrestamo.nombreSolicitante"
              outlined
              label="Nombre completo *"
              maxlength="150"
              :disable="procesando"
              :rules="[v => !!v?.trim() || 'El nombre es obligatorio']"
            />

            <div class="formulario-grid">
              <q-input
                v-model="nuevoPrestamo.identificacion"
                outlined
                label="Identificación *"
                maxlength="40"
                :disable="procesando"
                :rules="[v => !!v?.trim() || 'La identificación es obligatoria']"
              />

              <q-input
                v-model="nuevoPrestamo.areaPrograma"
                outlined
                label="Área o programa *"
                maxlength="150"
                :disable="procesando"
                :rules="[v => !!v?.trim() || 'El área o programa es obligatorio']"
              />

              <q-input
                v-model="nuevoPrestamo.correo"
                outlined
                type="email"
                label="Correo electrónico *"
                maxlength="150"
                :disable="procesando"
                :rules="[
                  v => !!v?.trim() || 'El correo es obligatorio',
                  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') || 'Ingresa un correo válido'
                ]"
              />

              <q-input
                v-model="nuevoPrestamo.telefono"
                outlined
                label="Teléfono *"
                maxlength="30"
                :disable="procesando"
                :rules="[v => !!v?.trim() || 'El teléfono es obligatorio']"
              />
            </div>

            <q-input
              v-model="nuevoPrestamo.lugarEntrega"
              outlined
              label="Lugar de entrega *"
              maxlength="200"
              :disable="procesando"
              :rules="[v => !!v?.trim() || 'El lugar de entrega es obligatorio']"
            />

            <q-separator class="q-my-md" />

            <div class="productos-formulario-header">
              <div class="formulario-seccion-titulo">Productos a entregar</div>
              <q-btn
                flat dense color="primary" icon="add" label="Agregar producto"
                :disable="procesando || !productosDisponibles.length"
                @click="agregarProductoPrestamo"
              />
            </div>

            <div v-if="!productosDisponibles.length" class="formulario-nota formulario-nota-alerta">
              No hay productos con existencias disponibles.
            </div>

            <div
              v-for="(item, indice) in nuevoPrestamo.productos"
              :key="item.id"
              class="producto-formulario"
            >
              <div class="producto-formulario-campos">
                <q-select
                  v-model="item.producto"
                  outlined
                  emit-value
                  map-options
                  label="Producto *"
                  :options="opcionesProductos(item)"
                  option-label="label"
                  option-value="value"
                  :disable="procesando"
                  :rules="[v => !!v || 'Selecciona un producto']"
                />

                <q-input
                  v-model.number="item.cantidad"
                  outlined
                  type="number"
                  min="1"
                  step="1"
                  :label="`Cantidad (${unidadProducto(item.producto)}) *`"
                  :disable="procesando"
                  :rules="[
                    v => Number.isInteger(Number(v)) && Number(v) > 0 || 'Ingresa una cantidad entera positiva',
                    v => Number(v) <= stockDisponible(item.producto) || `Existencias disponibles: ${stockDisponible(item.producto)}`
                  ]"
                />
              </div>

              <div class="producto-formulario-pie">
                <div v-if="item.producto" class="stock-disponible">
                  Existencias actuales:
                  <strong>{{ stockDisponible(item.producto) }} {{ unidadProducto(item.producto) }}</strong>
                </div>

                <q-btn
                  flat round dense color="negative" icon="delete_outline"
                  aria-label="Quitar producto"
                  :disable="procesando || nuevoPrestamo.productos.length === 1"
                  @click="quitarProductoPrestamo(indice)"
                >
                  <q-tooltip>Quitar producto</q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-input
              v-model="nuevoPrestamo.observaciones"
              outlined
              type="textarea"
              label="Observaciones"
              placeholder="Detalles adicionales de la entrega..."
              maxlength="500"
              counter
              rows="3"
              :disable="procesando"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="dialogo-acciones">
            <q-btn
              flat color="grey-7" label="Cancelar"
              :disable="procesando"
              @click="cerrarFormularioPrestamo"
            />
            <q-btn
              color="primary"
              icon="local_shipping"
              label="Registrar y entregar"
              type="submit"
              :loading="procesando"
              :disable="!productosDisponibles.length"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- DETALLE -->
    <q-dialog v-model="dialogoDetalle">
      <q-card class="dialogo-detalle">
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">PRÉSTAMO</div>
            <h2>Detalle de solicitud</h2>
            <p>Información completa del préstamo seleccionado.</p>
          </div>
          <q-btn flat round dense icon="close" @click="dialogoDetalle = false" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="prestamoSeleccionado" class="detalle-contenido">
          <div class="detalle-estado">
            <span>Estado actual</span>
            <q-badge
              rounded
              class="estado-badge"
              :color="colorEstado(prestamoSeleccionado.estado)"
              :label="prestamoSeleccionado.estado"
            />
          </div>

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="person" />
              Información del solicitante
            </div>

            <div class="detalle-grid">
              <div class="detalle-item">
                <span>Tipo de persona</span>
                <strong>{{ tipoPersonaTexto(prestamoSeleccionado.tipoPersona) }}</strong>
              </div>
              <div class="detalle-item">
                <span>Nombre</span>
                <strong>{{ prestamoSeleccionado.nombreSolicitante || '—' }}</strong>
              </div>
              <div class="detalle-item">
                <span>Identificación</span>
                <strong>{{ prestamoSeleccionado.identificacion || '—' }}</strong>
              </div>
              <div class="detalle-item">
                <span>Área / programa</span>
                <strong>{{ prestamoSeleccionado.areaPrograma || '—' }}</strong>
              </div>
              <div class="detalle-item">
                <span>Correo</span>
                <strong>{{ prestamoSeleccionado.correo || '—' }}</strong>
              </div>
              <div class="detalle-item">
                <span>Teléfono</span>
                <strong>{{ prestamoSeleccionado.telefono || '—' }}</strong>
              </div>
              <div class="detalle-item">
                <span>Lugar de entrega</span>
                <strong>{{ prestamoSeleccionado.lugarEntrega || '—' }}</strong>
              </div>
            </div>
          </div>

          <q-separator />

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="event" />
              Fechas
            </div>

            <div class="detalle-grid">
              <div class="detalle-item">
                <span>Fecha de solicitud</span>
                <strong>{{ formatearFecha(prestamoSeleccionado.fechaSolicitud || prestamoSeleccionado.createdAt) }}</strong>
              </div>
              <div class="detalle-item">
                <span>Devolución prevista</span>
                <strong>{{ formatearFecha(prestamoSeleccionado.fechaDevolucionPrevista) }}</strong>
              </div>
              <div class="detalle-item">
                <span>Fecha de aprobación</span>
                <strong>{{ formatearFecha(prestamoSeleccionado.fechaAprobacion) }}</strong>
              </div>
              <div class="detalle-item">
                <span>Fecha de entrega</span>
                <strong>{{ formatearFecha(prestamoSeleccionado.fechaEntrega) }}</strong>
              </div>
              <div class="detalle-item">
                <span>Devolución real</span>
                <strong>{{ formatearFecha(prestamoSeleccionado.fechaDevolucionReal) }}</strong>
              </div>
            </div>
          </div>

          <q-separator />

          <div class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="inventory_2" />
              Productos solicitados
            </div>

            <div class="productos-detalle">
              <div
                v-for="item in prestamoSeleccionado.productos || []"
                :key="item.producto?._id || item._id"
                class="producto-detalle"
              >
                <div class="producto-icono">
                  <q-icon name="inventory_2" size="22px" />
                </div>
                <div class="producto-info">
                  <strong>{{ item.producto?.nombre || 'Producto no disponible' }}</strong>
                  <span>Código: {{ item.producto?.codigo || '—' }}</span>
                  <span v-if="item.producto?.marca">Marca: {{ item.producto.marca }}</span>
                </div>
                <div class="producto-cantidad">
                  <span>Cantidad</span>
                  <strong>{{ item.cantidad }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div v-if="prestamoSeleccionado.observaciones" class="detalle-seccion">
            <div class="detalle-titulo">
              <q-icon name="notes" />
              Observaciones
            </div>
            <div class="observaciones">{{ prestamoSeleccionado.observaciones }}</div>
          </div>

          <div v-if="prestamoSeleccionado.motivoRechazo" class="detalle-seccion rechazo-info">
            <div class="detalle-titulo">
              <q-icon name="info" />
              Motivo del rechazo
            </div>
            <div class="observaciones">{{ prestamoSeleccionado.motivoRechazo }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="Cerrar" @click="dialogoDetalle = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- APROBAR -->
    <q-dialog v-model="dialogoAprobacion" persistent>
      <q-card class="dialogo-confirmacion">
        <q-card-section class="confirmacion-contenido">
          <div class="confirmacion-icon confirmacion-aprobar">
            <q-icon name="check_circle" size="38px" />
          </div>
          <div class="confirmacion-texto">
            <div class="eyebrow">SOLICITUD DE PRÉSTAMO</div>
            <h2>Aprobar préstamo</h2>
            <p>
              ¿Deseas aprobar la solicitud de
              <strong>{{ prestamoAAprobar?.nombreSolicitante || 'este aprendiz' }}</strong>?
            </p>
            <div class="confirmacion-info">
              <q-icon name="info" size="18px" />
              <span>Al aprobarla, quedará disponible para registrar la entrega.</span>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat label="Cancelar" :disable="procesando" @click="cerrarAprobacion" />
          <q-btn color="positive" icon="check" label="Aprobar préstamo" :loading="procesando" @click="aprobar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- RECHAZAR -->
    <q-dialog v-model="dialogoRechazo" persistent>
      <q-card class="dialogo-rechazo">
        <q-card-section class="dialogo-header">
          <div>
            <div class="eyebrow">SOLICITUD</div>
            <h2>Rechazar préstamo</h2>
            <p>Indica el motivo por el cual se rechaza esta solicitud.</p>
          </div>
          <q-btn flat round dense icon="close" :disable="procesando" @click="cerrarRechazo" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-if="prestamoARechazar" class="solicitud-rechazo">
            <strong>{{ prestamoARechazar.nombreSolicitante }}</strong>
            <span>{{ cantidadProductos(prestamoARechazar) }} producto(s) solicitado(s)</span>
          </div>
          <q-input
            v-model="motivoRechazo"
            outlined
            type="textarea"
            label="Motivo del rechazo *"
            placeholder="Escribe el motivo..."
            rows="5"
            maxlength="500"
            counter
            :disable="procesando"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat label="Cancelar" :disable="procesando" @click="cerrarRechazo" />
          <q-btn color="negative" icon="close" label="Rechazar préstamo" :loading="procesando" @click="rechazar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CONFIRMAR ENTREGA -->
    <q-dialog v-model="dialogoEntrega" persistent>
      <q-card class="dialogo-confirmacion">
        <q-card-section class="confirmacion-contenido">
          <div class="confirmacion-icon confirmacion-entrega">
            <q-icon name="local_shipping" size="38px" />
          </div>
          <div class="confirmacion-texto">
            <div class="eyebrow">ENTREGA DE PRÉSTAMO</div>
            <h2>Registrar entrega</h2>
            <p>
              ¿Deseas registrar la entrega del préstamo de
              <strong>{{ prestamoAEntregar?.nombreSolicitante || 'este aprendiz' }}</strong>?
            </p>
            <div class="confirmacion-info">
              <q-icon name="inventory_2" size="18px" />
              <span>Al registrar la entrega, se descontará del inventario la cantidad de cada producto.</span>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat label="Cancelar" :disable="procesando" @click="cerrarEntrega" />
          <q-btn color="primary" icon="local_shipping" label="Registrar entrega" :loading="procesando" @click="entregar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CONFIRMAR DEVOLUCIÓN -->
    <q-dialog v-model="dialogoDevolucion" persistent>
      <q-card class="dialogo-confirmacion">
        <q-card-section class="confirmacion-contenido">
          <div class="confirmacion-icon confirmacion-devolucion">
            <q-icon name="assignment_return" size="38px" />
          </div>
          <div class="confirmacion-texto">
            <div class="eyebrow">DEVOLUCIÓN DE PRÉSTAMO</div>
            <h2>Registrar devolución</h2>
            <p>
              ¿Deseas registrar la devolución del préstamo de
              <strong>{{ prestamoADevolver?.nombreSolicitante || 'este aprendiz' }}</strong>?
            </p>
            <div class="confirmacion-info">
              <q-icon name="inventory_2" size="18px" />
              <span>Al registrar la devolución, las cantidades serán reintegradas al inventario.</span>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat label="Cancelar" :disable="procesando" @click="cerrarDevolucion" />
          <q-btn color="orange" icon="assignment_return" label="Registrar devolución" :loading="procesando" @click="devolver" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ELIMINAR -->
    <q-dialog v-model="dialogoEliminacion" persistent>
      <q-card class="dialogo-confirmacion">
        <q-card-section class="confirmacion-contenido">
          <div class="confirmacion-icon confirmacion-eliminar">
            <q-icon name="delete_forever" size="38px" />
          </div>
          <div class="confirmacion-texto">
            <div class="eyebrow">ELIMINAR SOLICITUD</div>
            <h2>Eliminar préstamo</h2>
            <p>
              ¿Estás seguro de eliminar la solicitud de
              <strong>{{ prestamoAEliminar?.nombreSolicitante || 'esta persona' }}</strong>?
            </p>
            <div class="confirmacion-info confirmacion-info-eliminar">
              <q-icon name="warning" size="18px" />
              <span>Esta acción eliminará permanentemente el registro.</span>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="dialogo-acciones">
          <q-btn flat label="Cancelar" :disable="procesando" @click="cerrarEliminacion" />
          <q-btn color="negative" icon="delete" label="Eliminar definitivamente" :loading="procesando" @click="eliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()

// ESTADO
const prestamos = ref([])
const cargando = ref(false)
const procesando = ref(false)
const busqueda = ref('')
const filtroEstado = ref(null)

const dialogoDetalle = ref(false)
const prestamoSeleccionado = ref(null)
const dialogoRechazo = ref(false)
const prestamoARechazar = ref(null)
const motivoRechazo = ref('')
const dialogoAprobacion = ref(false)
const prestamoAAprobar = ref(null)
const dialogoEntrega = ref(false)
const prestamoAEntregar = ref(null)
const dialogoDevolucion = ref(false)
const prestamoADevolver = ref(null)
const dialogoEliminacion = ref(false)
const prestamoAEliminar = ref(null)

// FORMULARIO ADMINISTRATIVO
const dialogoCrearPrestamo = ref(false)
const productosInventario = ref([])
let siguienteIdProducto = 2

const opcionesTipoPersona = [
  { label: 'Aprendiz', value: 'aprendiz' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Funcionario', value: 'funcionario' },
  { label: 'Otro', value: 'otro' },
]

const nuevoPrestamo = ref(formularioVacio())

function formularioVacio() {
  return {
    tipoPersona: 'aprendiz',
    nombreSolicitante: '',
    identificacion: '',
    areaPrograma: '',
    correo: '',
    telefono: '',
    lugarEntrega: '',
    observaciones: '',
    productos: [{ id: 1, producto: null, cantidad: 1 }],
  }
}

const productosDisponibles = computed(() =>
  productosInventario.value.filter(producto =>
    producto.activo !== false &&
    producto.estado !== 'Retirado' &&
    Number(producto.stock) > 0
  )
)

const productoPorId = (productoId) => productosInventario.value.find(
  item => String(item._id) === String(productoId)
) || null

const stockDisponible = (productoId) => {
  const producto = productoPorId(productoId)
  return producto ? Number(producto.stock) || 0 : 0
}

const unidadProducto = (productoId) => productoPorId(productoId)?.unidadMedida || 'unidad'

const opcionesProductos = (itemActual) => {
  const seleccionados = nuevoPrestamo.value.productos
    .filter(item => item !== itemActual && item.producto)
    .map(item => String(item.producto))

  return productosDisponibles.value
    .filter(producto =>
      !seleccionados.includes(String(producto._id)) ||
      String(producto._id) === String(itemActual.producto)
    )
    .map(producto => ({
      label: `${producto.codigo || 'Sin código'} — ${producto.nombre} (stock: ${producto.stock} ${producto.unidadMedida || 'unidad'})`,
      value: producto._id,
    }))
}

const agregarProductoPrestamo = () => {
  nuevoPrestamo.value.productos.push({
    id: siguienteIdProducto++,
    producto: null,
    cantidad: 1,
  })
}

const quitarProductoPrestamo = (indice) => {
  if (nuevoPrestamo.value.productos.length > 1) {
    nuevoPrestamo.value.productos.splice(indice, 1)
  }
}

const cargarProductosInventario = async () => {
  const resultado = await api.obtenerProductos()
  productosInventario.value = Array.isArray(resultado)
    ? resultado
    : Array.isArray(resultado?.productos)
      ? resultado.productos
      : []
}

const abrirFormularioPrestamo = async () => {
  try {
    await cargarProductosInventario()

    if (!productosDisponibles.value.length) {
      $q.notify({
        type: 'warning',
        message: 'No hay productos con existencias disponibles.',
      })
      return
    }

    dialogoCrearPrestamo.value = true
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No fue posible cargar el inventario.',
    })
  }
}

const cerrarFormularioPrestamo = () => {
  if (procesando.value) return
  dialogoCrearPrestamo.value = false
  nuevoPrestamo.value = formularioVacio()
  siguienteIdProducto++
}

const crearPrestamoAdministrativo = async () => {
  const formulario = nuevoPrestamo.value

  if (!formulario.productos.length) {
    $q.notify({ type: 'warning', message: 'Agrega al menos un producto.' })
    return
  }

  const idsProductos = formulario.productos.map(item => String(item.producto || ''))

  if (idsProductos.some(id => !id)) {
    $q.notify({ type: 'warning', message: 'Selecciona un producto en cada fila.' })
    return
  }

  if (new Set(idsProductos).size !== idsProductos.length) {
    $q.notify({ type: 'warning', message: 'No puedes seleccionar el mismo producto dos veces.' })
    return
  }

  for (const item of formulario.productos) {
    const cantidad = Number(item.cantidad)
    const stock = stockDisponible(item.producto)

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      $q.notify({ type: 'warning', message: 'Las cantidades deben ser números positivos.' })
      return
    }

    if (cantidad > stock) {
      $q.notify({ type: 'warning', message: `La cantidad supera el stock disponible (${stock}).` })
      return
    }
  }

  procesando.value = true

  try {
    const datos = {
      tipoPersona: formulario.tipoPersona,
      nombreSolicitante: formulario.nombreSolicitante.trim(),
      identificacion: formulario.identificacion.trim(),
      areaPrograma: formulario.areaPrograma.trim(),
      correo: formulario.correo.trim(),
      telefono: formulario.telefono.trim(),
      lugarEntrega: formulario.lugarEntrega.trim(),
      observaciones: formulario.observaciones.trim(),
      productos: formulario.productos.map(item => ({
        producto: item.producto,
        cantidad: Number(item.cantidad),
      })),
    }

    await api.crearPrestamoAdministrativo(datos)

    $q.notify({
      type: 'positive',
      message: 'Préstamo registrado y entregado correctamente.',
    })

    dialogoCrearPrestamo.value = false
    nuevoPrestamo.value = formularioVacio()
    await cargarPrestamos()
    await cargarProductosInventario()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No fue posible registrar el préstamo.',
    })
  } finally {
    procesando.value = false
  }
}

// TABLA
const columnas = [
  { name: 'solicitante', label: 'SOLICITANTE', field: 'nombreSolicitante', align: 'left', sortable: true },
  { name: 'contacto', label: 'CONTACTO', field: 'correo', align: 'left' },
  { name: 'productos', label: 'PRODUCTOS', field: 'productos', align: 'left' },
  { name: 'fechaDevolucionPrevista', label: 'DEVOLUCIÓN PREVISTA', field: 'fechaDevolucionPrevista', align: 'center', sortable: true },
  { name: 'estado', label: 'ESTADO', field: 'estado', align: 'center', sortable: true },
  { name: 'fechaSolicitud', label: 'SOLICITUD', field: 'fechaSolicitud', align: 'center', sortable: true },
  { name: 'acciones', label: 'ACCIONES', field: '_id', align: 'center' },
]

const opcionesEstado = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Aprobado', value: 'Aprobado' },
  { label: 'Rechazado', value: 'Rechazado' },
  { label: 'Entregado', value: 'Entregado' },
  { label: 'Devuelto', value: 'Devuelto' },
]

const resumenes = [
  { titulo: 'Total préstamos', estado: null, icono: 'inventory_2', clase: 'resumen-total' },
  { titulo: 'Pendientes', estado: 'Pendiente', icono: 'pending_actions', clase: 'resumen-pendiente' },
  { titulo: 'Aprobados', estado: 'Aprobado', icono: 'check_circle', clase: 'resumen-aprobado' },
  { titulo: 'Entregados', estado: 'Entregado', icono: 'local_shipping', clase: 'resumen-entregado' },
  { titulo: 'Devueltos', estado: 'Devuelto', icono: 'assignment_return', clase: 'resumen-devuelto' },
]

const prestamosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return prestamos.value.filter(prestamo => {
    if (filtroEstado.value && prestamo.estado !== filtroEstado.value) return false
    if (!texto) return true

    return [
      prestamo.nombreSolicitante,
      prestamo.identificacion,
      prestamo.correo,
      prestamo.areaPrograma,
    ].some(valor => String(valor || '').toLowerCase().includes(texto))
  })
})

const cantidadPorEstado = estado =>
  prestamos.value.filter(prestamo => prestamo.estado === estado).length

const cargarPrestamos = async () => {
  cargando.value = true
  try {
    const resultado = await api.obtenerPrestamos()
    prestamos.value = Array.isArray(resultado)
      ? resultado
      : Array.isArray(resultado?.prestamos)
        ? resultado.prestamos
        : []
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No fue posible cargar los préstamos.',
    })
  } finally {
    cargando.value = false
  }
}

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroEstado.value = null
}

const cantidadProductos = prestamo =>
  Array.isArray(prestamo?.productos) ? prestamo.productos.length : 0

const productosVisibles = prestamo =>
  Array.isArray(prestamo?.productos) ? prestamo.productos.slice(0, 2) : []

const tipoPersonaTexto = tipo => ({
  aprendiz: 'Aprendiz',
  instructor: 'Instructor',
  funcionario: 'Funcionario',
  otro: 'Otro',
}[tipo] || 'No especificado')

const colorEstado = estado => ({
  Pendiente: 'orange',
  Aprobado: 'primary',
  Rechazado: 'negative',
  Entregado: 'deep-purple',
  Devuelto: 'positive',
}[estado] || 'grey')

const formatearFecha = fecha => {
  if (!fecha) return '—'
  const convertida = new Date(fecha)
  if (Number.isNaN(convertida.getTime())) return '—'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(convertida)
}

// DETALLE
const verDetalle = prestamo => {
  prestamoSeleccionado.value = prestamo
  dialogoDetalle.value = true
}

// APROBAR
const confirmarAprobacion = prestamo => {
  prestamoAAprobar.value = prestamo
  dialogoAprobacion.value = true
}

const cerrarAprobacion = () => {
  if (procesando.value) return
  dialogoAprobacion.value = false
  prestamoAAprobar.value = null
}

const aprobar = async () => {
  if (!prestamoAAprobar.value) return
  procesando.value = true

  try {
    await api.aprobarPrestamo(prestamoAAprobar.value._id)
    $q.notify({ type: 'positive', message: 'Préstamo aprobado correctamente.' })
    dialogoAprobacion.value = false
    prestamoAAprobar.value = null
    await cargarPrestamos()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'No fue posible aprobar el préstamo.' })
  } finally {
    procesando.value = false
  }
}

// RECHAZAR
const abrirRechazo = prestamo => {
  prestamoARechazar.value = prestamo
  motivoRechazo.value = ''
  dialogoRechazo.value = true
}

const cerrarRechazo = () => {
  if (procesando.value) return
  dialogoRechazo.value = false
  prestamoARechazar.value = null
  motivoRechazo.value = ''
}

const rechazar = async () => {
  if (!motivoRechazo.value.trim()) {
    $q.notify({ type: 'warning', message: 'El motivo del rechazo es obligatorio.' })
    return
  }
  if (!prestamoARechazar.value) return

  procesando.value = true
  try {
    await api.rechazarPrestamo(prestamoARechazar.value._id, motivoRechazo.value.trim())
    $q.notify({ type: 'positive', message: 'Préstamo rechazado correctamente.' })
    cerrarRechazoDespuesDeExito()
    await cargarPrestamos()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'No fue posible rechazar el préstamo.' })
  } finally {
    procesando.value = false
  }
}

const cerrarRechazoDespuesDeExito = () => {
  dialogoRechazo.value = false
  prestamoARechazar.value = null
  motivoRechazo.value = ''
}

// ENTREGAR
const confirmarEntrega = prestamo => {
  prestamoAEntregar.value = prestamo
  dialogoEntrega.value = true
}

const cerrarEntrega = () => {
  if (procesando.value) return
  dialogoEntrega.value = false
  prestamoAEntregar.value = null
}

const entregar = async () => {
  if (!prestamoAEntregar.value) return
  procesando.value = true

  try {
    await api.entregarPrestamo(prestamoAEntregar.value._id)
    $q.notify({ type: 'positive', message: 'Entrega registrada y stock actualizado correctamente.' })
    dialogoEntrega.value = false
    prestamoAEntregar.value = null
    await cargarPrestamos()
    await cargarProductosInventario()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'No fue posible registrar la entrega.' })
  } finally {
    procesando.value = false
  }
}

// DEVOLVER
const confirmarDevolucion = prestamo => {
  prestamoADevolver.value = prestamo
  dialogoDevolucion.value = true
}

const cerrarDevolucion = () => {
  if (procesando.value) return
  dialogoDevolucion.value = false
  prestamoADevolver.value = null
}

const devolver = async () => {
  if (!prestamoADevolver.value) return
  procesando.value = true

  try {
    await api.devolverPrestamo(prestamoADevolver.value._id)
    $q.notify({ type: 'positive', message: 'Devolución registrada y stock actualizado correctamente.' })
    dialogoDevolucion.value = false
    prestamoADevolver.value = null
    await cargarPrestamos()
    await cargarProductosInventario()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'No fue posible registrar la devolución.' })
  } finally {
    procesando.value = false
  }
}

// ELIMINAR
const confirmarEliminacion = prestamo => {
  prestamoAEliminar.value = prestamo
  dialogoEliminacion.value = true
}

const cerrarEliminacion = () => {
  if (procesando.value) return
  dialogoEliminacion.value = false
  prestamoAEliminar.value = null
}

const eliminar = async () => {
  if (!prestamoAEliminar.value) return
  procesando.value = true

  try {
    await api.eliminarPrestamo(prestamoAEliminar.value._id)
    $q.notify({ type: 'positive', message: 'Solicitud eliminada correctamente.' })
    dialogoEliminacion.value = false
    prestamoAEliminar.value = null
    await cargarPrestamos()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message || 'No fue posible eliminar la solicitud.' })
  } finally {
    procesando.value = false
  }
}

onMounted(cargarPrestamos)
</script>

<style scoped>
.prestamos-page {
  padding: 28px;
  color: #1f2937;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin-bottom: 6px;
  color: #1976d2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.page-header h1,
.dialogo-header h2 {
  margin: 0;
  font-weight: 700;
}

.page-header h1 {
  font-size: 32px;
}

.page-header p,
.dialogo-header p {
  margin: 6px 0 0;
  color: #6b7280;
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

.resumen-card,
.filtros-card,
.tabla-card {
  border-radius: 12px;
}

.resumen-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.resumen-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 12px;
}

.resumen-total { background: #eaf2ff; color: #1976d2; }
.resumen-pendiente { background: #fff4df; color: #f57c00; }
.resumen-aprobado { background: #e8f1ff; color: #1976d2; }
.resumen-entregado { background: #eee9ff; color: #673ab7; }
.resumen-devuelto { background: #e7f7ee; color: #21a366; }

.resumen-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.resumen-info span {
  color: #6b7280;
  font-size: 13px;
}

.resumen-info strong {
  font-size: 25px;
  line-height: 1;
}

.filtros-card {
  margin-bottom: 20px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 220px auto;
  align-items: center;
  gap: 14px;
}

.tabla-card {
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

.solicitante-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
}

.avatar-solicitante,
.producto-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eaf2ff;
  color: #1976d2;
}

.avatar-solicitante {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
}

.nombre-solicitante {
  font-weight: 600;
}

.dato-secundario {
  margin-top: 3px;
  color: #6b7280;
  font-size: 12px;
}

.contacto-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #4b5563;
  font-size: 13px;
}

.contacto-cell span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.productos-cell {
  min-width: 180px;
  max-width: 240px;
}

.producto-resumen {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  color: #4b5563;
  font-size: 12px;
}

.producto-resumen span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mas-productos {
  display: block;
  margin-top: 5px;
  color: #1976d2;
  font-size: 12px;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 600;
}

.acciones-cell {
  white-space: nowrap;
}

.acciones-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.dialogo-detalle,
.dialogo-rechazo,
.dialogo-confirmacion,
.dialogo-crear-prestamo {
  width: 100%;
  border-radius: 14px;
}

.dialogo-detalle { max-width: 850px; }
.dialogo-rechazo,
.dialogo-confirmacion { max-width: 560px; }
.dialogo-crear-prestamo { max-width: 720px; }

.dialogo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
}

.dialogo-header h2 {
  font-size: 24px;
}

.dialogo-acciones {
  padding: 16px 20px;
}

.formulario-prestamo {
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px;
}

.formulario-nota {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 22px;
  border-radius: 10px;
  background: #eaf2ff;
  color: #334155;
  font-size: 13px;
  line-height: 1.5;
}

.formulario-nota .q-icon {
  flex-shrink: 0;
  color: #1976d2;
}

.formulario-nota-alerta {
  background: #fff4df;
}

.formulario-nota-alerta .q-icon {
  color: #f57c00;
}

.formulario-seccion-titulo {
  margin-bottom: 16px;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}

.formulario-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.productos-formulario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.producto-formulario {
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.producto-formulario-campos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px;
  align-items: start;
  gap: 12px;
}

.producto-formulario-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stock-disponible {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.stock-disponible strong {
  color: #1976d2;
}

.detalle-contenido {
  max-height: 70vh;
  overflow-y: auto;
}

.detalle-estado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 20px;
}

.detalle-estado > span,
.detalle-item span {
  color: #6b7280;
  font-size: 12px;
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

.detalle-titulo .q-icon {
  font-size: 20px;
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

.detalle-item strong {
  font-size: 14px;
  word-break: break-word;
}

.productos-detalle {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.producto-detalle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.producto-icono {
  width: 44px;
  height: 44px;
  min-width: 44px;
}

.producto-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.producto-info strong {
  font-size: 14px;
}

.producto-info span {
  color: #6b7280;
  font-size: 12px;
}

.producto-cantidad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 70px;
}

.producto-cantidad span {
  color: #6b7280;
  font-size: 11px;
}

.producto-cantidad strong {
  color: #1976d2;
  font-size: 20px;
}

.observaciones {
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: #4b5563;
  line-height: 1.5;
  white-space: pre-wrap;
}

.rechazo-info .detalle-titulo {
  color: #d32f2f;
}

.rechazo-info .observaciones {
  background: #fff5f5;
  color: #991b1b;
}

.confirmacion-contenido {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 26px;
}

.confirmacion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 16px;
}

.confirmacion-aprobar { background: #e7f7ee; color: #21a366; }
.confirmacion-entrega { background: #eaf2ff; color: #1976d2; }
.confirmacion-devolucion { background: #fff4df; color: #f57c00; }
.confirmacion-eliminar { background: #fff0f0; color: #d32f2f; }

.confirmacion-texto {
  flex: 1;
  min-width: 0;
}

.confirmacion-texto h2 {
  margin: 0;
  font-size: 23px;
  font-weight: 700;
}

.confirmacion-texto p {
  margin: 8px 0 0;
  color: #6b7280;
  line-height: 1.5;
}

.confirmacion-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.confirmacion-info .q-icon {
  flex-shrink: 0;
  color: #1976d2;
}

.confirmacion-info-eliminar {
  background: #fff5f5;
  color: #991b1b;
}

.confirmacion-info-eliminar .q-icon {
  color: #d32f2f;
}

.solicitud-rechazo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
}

.solicitud-rechazo span {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .resumen-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filtros-grid {
    grid-template-columns: 1fr 200px;
  }

  .filtros-grid .q-btn {
    justify-self: start;
  }
}

@media (max-width: 800px) {
  .prestamos-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .acciones-header {
    width: 100%;
  }

  .acciones-header .q-btn {
    flex: 1;
  }

  .resumen-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtros-grid,
  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .confirmacion-contenido {
    padding: 22px;
  }
}

@media (max-width: 500px) {
  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .formulario-prestamo {
    padding: 16px;
  }

  .formulario-grid,
  .producto-formulario-campos {
    grid-template-columns: 1fr;
  }

  .productos-formulario-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .producto-detalle,
  .confirmacion-contenido {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
