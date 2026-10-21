<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()
const aprendices = ref([])
const cargando = ref(false)
const guardando = ref(false)
const procesandoAccion = ref(false)
const dialogo = ref(false)
const confirmacionAbierta = ref(false)
const accionPendiente = ref(null)
const formulario = reactive({ nombre: '', usuario: '', password: '', areaPrograma: '' })

const columnas = [
  { name: 'nombre', label: 'NOMBRE', field: 'nombre', align: 'left', sortable: true },
  { name: 'usuario', label: 'USUARIO', field: 'usuario', align: 'left', sortable: true },
  { name: 'areaPrograma', label: 'ÁREA / PROGRAMA', field: 'areaPrograma', align: 'left' },
  { name: 'activo', label: 'ESTADO', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'ACCIONES', field: '_id', align: 'center' },
]

const cargar = async () => {
  cargando.value = true
  try { aprendices.value = await api.obtenerAprendices() }
  catch (e) { $q.notify({ type: 'negative', message: e.message || 'No fue posible cargar las cuentas.' }) }
  finally { cargando.value = false }
}

const abrir = () => {
  Object.assign(formulario, { nombre: '', usuario: '', password: '', areaPrograma: '' })
  dialogo.value = true
}

const crear = async () => {
  if (!formulario.nombre.trim() || !formulario.usuario.trim() || !formulario.password) {
    $q.notify({ type: 'warning', message: 'Completa nombre, usuario y contraseña.' })
    return
  }
  guardando.value = true
  try {
    await api.crearAprendiz({ ...formulario })
    $q.notify({ type: 'positive', message: 'Cuenta de aprendiz creada correctamente.' })
    dialogo.value = false
    await cargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || 'No fue posible crear la cuenta.' })
  } finally { guardando.value = false }
}

const confirmarCambioEstado = (aprendiz) => {
  accionPendiente.value = { tipo: 'estado', aprendiz, activo: !aprendiz.activo }
  confirmacionAbierta.value = true
}

const confirmarEliminar = (aprendiz) => {
  accionPendiente.value = { tipo: 'eliminar', aprendiz }
  confirmacionAbierta.value = true
}

const ejecutarAccion = async () => {
  if (!accionPendiente.value) return
  const accion = accionPendiente.value
  procesandoAccion.value = true
  try {
    if (accion.tipo === 'estado') {
      await api.cambiarEstadoAprendiz(accion.aprendiz._id, accion.activo)
      $q.notify({ type: 'positive', message: `Acceso ${accion.activo ? 'activado' : 'desactivado'} correctamente.` })
    } else {
      await api.eliminarAprendiz(accion.aprendiz._id)
      $q.notify({ type: 'positive', message: 'Cuenta eliminada de la lista. Se conserva el historial asociado.' })
    }
    confirmacionAbierta.value = false
    accionPendiente.value = null
    await cargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || 'No fue posible completar la acción.' })
  } finally { procesandoAccion.value = false }
}

onMounted(cargar)
</script>

<template>
  <div class="q-pa-lg">
    <div class="row items-center justify-between q-gutter-md q-mb-lg">
      <div>
        <div class="text-overline text-primary">ADMINISTRACIÓN</div>
        <div class="text-h4 text-weight-bold">Cuentas de aprendices</div>
        <div class="text-body2 text-grey-7">Cada aprendiz inicia sesión con su propio usuario. Las cuentas eliminadas no pierden el historial asociado.</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn outline color="primary" icon="refresh" label="Actualizar" :loading="cargando" @click="cargar" />
        <q-btn color="primary" icon="person_add" label="Crear aprendiz" @click="abrir" />
      </div>
    </div>

    <q-card flat bordered>
      <q-table :rows="aprendices" :columns="columnas" row-key="_id" :loading="cargando" no-data-label="No hay aprendices registrados">
        <template #body-cell-activo="props">
          <q-td :props="props"><q-badge :color="props.row.activo ? 'positive' : 'grey'" :label="props.row.activo ? 'Activo' : 'Inactivo'" /></q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat round dense :color="props.row.activo ? 'negative' : 'positive'" :icon="props.row.activo ? 'block' : 'check_circle'" @click="confirmarCambioEstado(props.row)">
              <q-tooltip>{{ props.row.activo ? 'Desactivar acceso' : 'Activar acceso' }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar cuenta</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo" persistent>
      <q-card style="width: 520px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Crear cuenta de aprendiz</div>
          <div class="text-body2 text-grey-7">La contraseña se guarda cifrada y no se muestra en el listado.</div>
        </q-card-section>
        <q-separator />
        <q-form @submit.prevent="crear">
          <q-card-section class="q-gutter-md">
            <q-input v-model="formulario.nombre" outlined label="Nombre completo *" maxlength="150" :disable="guardando" />
            <q-input v-model="formulario.usuario" outlined label="Usuario *" hint="3–30 caracteres: letras, números, punto, guion o guion bajo" :disable="guardando" />
            <q-input v-model="formulario.password" outlined type="password" label="Contraseña temporal *" hint="Mínimo 6 caracteres" :disable="guardando" />
            <q-input v-model="formulario.areaPrograma" outlined label="Área o programa (opcional)" :disable="guardando" />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup :disable="guardando" />
            <q-btn color="primary" type="submit" label="Crear cuenta" :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmacionAbierta" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon :name="accionPendiente?.tipo === 'eliminar' ? 'delete_forever' : 'manage_accounts'" color="negative" size="32px" />
          <div class="text-h6">{{ accionPendiente?.tipo === 'eliminar' ? 'Eliminar cuenta de aprendiz' : (accionPendiente?.activo ? 'Activar acceso' : 'Desactivar acceso') }}</div>
        </q-card-section>
        <q-card-section>
          <template v-if="accionPendiente?.tipo === 'eliminar'">
            ¿Deseas eliminar la cuenta de <strong>{{ accionPendiente?.aprendiz?.nombre }}</strong>? No podrá iniciar sesión. Los préstamos y movimientos históricos se conservarán.
          </template>
          <template v-else>
            ¿Deseas {{ accionPendiente?.activo ? 'activar' : 'desactivar' }} el acceso de <strong>{{ accionPendiente?.aprendiz?.nombre }}</strong>?
          </template>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" :disable="procesandoAccion" @click="confirmacionAbierta = false" />
          <q-btn color="negative" :icon="accionPendiente?.tipo === 'eliminar' ? 'delete' : 'check'" :label="accionPendiente?.tipo === 'eliminar' ? 'Eliminar' : 'Confirmar'" :loading="procesandoAccion" @click="ejecutarAccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
