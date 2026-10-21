<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const drawerAbierto = ref(true)
const mostrarModalCerrarSesion = ref(false)

const usuario = computed(() => {
  try {
    return JSON.parse(sessionStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
})

const menuPrincipal = [
  { label: 'Cotizador', icon: 'calculate', to: '/aprendiz/cotizador' },
  { label: 'Inventario', icon: 'inventory_2', to: '/aprendiz/inventario' },
  { label: 'Solicitar préstamo', icon: 'add_shopping_cart', to: '/aprendiz/prestamos/solicitar' },
]

const navegar = (ruta) => {
  router.push(ruta)
}

const abrirCerrarSesion = () => {
  mostrarModalCerrarSesion.value = true
}

const cancelarCerrarSesion = () => {
  mostrarModalCerrarSesion.value = false
}

const confirmarCerrarSesion = () => {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('usuario')

  mostrarModalCerrarSesion.value = false

  router.push('/')
}
</script>

<template>
  <q-layout view="hHh LpR fFf" class="aprendiz-layout">

    <!-- ============================== -->
    <!-- HEADER -->
    <!-- ============================== -->

    <q-header class="aprendiz-header">
      <q-toolbar class="header-toolbar">

        <q-btn
          flat
          round
          dense
          icon="menu"
          aria-label="Abrir menú"
          @click="drawerAbierto = !drawerAbierto"
        />

        <div class="header-title">
          <div class="header-title-main">
            Sistema de Inventario
          </div>

          <div class="header-title-sub">
            Portal del Aprendiz
          </div>
        </div>

        <q-space />

        <div class="header-user">

          <q-avatar
            size="40px"
            class="user-avatar"
          >
            <q-icon
              name="person"
              size="22px"
            />
          </q-avatar>

          <div class="user-info">

            <div class="user-name">
              {{ usuario.nombre || 'Aprendiz' }}
            </div>

            <div class="user-role">
              Aprendiz
            </div>

          </div>

        </div>

      </q-toolbar>
    </q-header>


    <!-- ============================== -->
    <!-- SIDEBAR -->
    <!-- ============================== -->

    <q-drawer
      v-model="drawerAbierto"
      show-if-above
      bordered
      :width="270"
      class="aprendiz-drawer"
    >

      <div class="drawer-content">

        <!-- MARCA -->

        <div class="brand">

          <div class="brand-icon">
            <q-icon
              name="school"
              size="27px"
            />
          </div>

          <div>

            <div class="brand-title">
              Inventario
            </div>

            <div class="brand-subtitle">
              Portal del Aprendiz
            </div>

          </div>

        </div>


        <q-separator class="drawer-separator" />


        <!-- MENÚ -->

        <div class="menu-label">
          PRINCIPAL
        </div>

        <q-list class="menu-list">

          <q-item
            v-for="item in menuPrincipal"
            :key="item.to"
            clickable
            v-ripple
            class="menu-item"
            :class="{
              'menu-item-active': $route.path === item.to
            }"
            @click="navegar(item.to)"
          >

            <q-item-section avatar>

              <q-icon
                :name="item.icon"
                size="21px"
              />

            </q-item-section>

            <q-item-section>

              <q-item-label>
                {{ item.label }}
              </q-item-label>

            </q-item-section>

          </q-item>

        </q-list>


        <q-space />


        <!-- CERRAR SESIÓN -->

        <div class="drawer-bottom">

          <q-separator class="drawer-separator" />

          <q-item
            clickable
            v-ripple
            class="logout-item"
            @click="abrirCerrarSesion"
          >

            <q-item-section avatar>

              <q-icon
                name="logout"
                size="21px"
              />

            </q-item-section>

            <q-item-section>

              <q-item-label>
                Cerrar sesión
              </q-item-label>

            </q-item-section>

          </q-item>

        </div>

      </div>

    </q-drawer>


    <!-- ============================== -->
    <!-- CONTENIDO -->
    <!-- ============================== -->

    <q-page-container class="page-container">

      <router-view />

    </q-page-container>


    <!-- ============================== -->
    <!-- MODAL CERRAR SESIÓN -->
    <!-- ============================== -->

    <transition name="modal-fade">

      <div
        v-if="mostrarModalCerrarSesion"
        class="logout-modal-overlay"
        @click.self="cancelarCerrarSesion"
      >

        <div class="logout-modal">

          <div class="logout-modal-icon">
            <q-icon
              name="logout"
              size="28px"
            />
          </div>

          <div class="logout-modal-content">

            <h2>
              Cerrar sesión
            </h2>

            <p>
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </p>

            <span>
              Tendrás que iniciar sesión nuevamente para acceder al sistema.
            </span>

          </div>

          <div class="logout-modal-actions">

            <button
              type="button"
              class="logout-btn-cancel"
              @click="cancelarCerrarSesion"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="logout-btn-confirm"
              @click="confirmarCerrarSesion"
            >
              <q-icon
                name="logout"
                size="18px"
              />

              Cerrar sesión
            </button>

          </div>

        </div>

      </div>

    </transition>

  </q-layout>
</template>

<style scoped>
.aprendiz-layout {
  background: #f4f7fb;
}


/* ================================= */
/* HEADER */
/* ================================= */

.aprendiz-header {
  background: #ffffff;
  color: #172033;
  border-bottom: 1px solid #e7ebf0;
  box-shadow: none;
}

.header-toolbar {
  min-height: 72px;
  padding: 0 28px;
}

.header-title {
  margin-left: 16px;
}

.header-title-main {
  font-size: 17px;
  font-weight: 700;
  color: #172033;
}

.header-title-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #8792a2;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 11px;
}

.user-avatar {
  background: #eaf2fc;
  color: #1976d2;
}

.user-info {
  min-width: 120px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #172033;
}

.user-role {
  margin-top: 2px;
  font-size: 11px;
  color: #8792a2;
}


/* ================================= */
/* DRAWER */
/* ================================= */

.aprendiz-drawer {
  background: #ffffff;
  color: #172033;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 22px 16px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 18px;
}

.brand-icon {
  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background: #1976d2;
  color: #ffffff;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #172033;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: #8792a2;
}

.drawer-separator {
  background: #edf0f4;
}


/* ================================= */
/* MENÚ */
/* ================================= */

.menu-label {
  padding: 24px 12px 10px;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 0.08em;

  color: #9aa4b2;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  min-height: 48px;

  border-radius: 10px;

  color: #667085;

  transition: 0.2s ease;
}

.menu-item:hover {
  background: #f4f7fb;
  color: #1976d2;
}

.menu-item-active {
  background: #eaf2fc;
  color: #1976d2;

  font-weight: 600;
}


/* ================================= */
/* LOGOUT */
/* ================================= */

.drawer-bottom {
  margin-top: auto;
}

.logout-item {
  min-height: 48px;

  margin-top: 10px;

  border-radius: 10px;

  color: #667085;
}

.logout-item:hover {
  background: #fff1f1;
  color: #c62828;
}


/* ================================= */
/* CONTENIDO */
/* ================================= */

.page-container {
  background: #f4f7fb;
}


/* ================================= */
/* MODAL */
/* ================================= */

.logout-modal-overlay {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(15, 23, 42, 0.48);

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.logout-modal {
  width: 100%;
  max-width: 430px;

  background: #ffffff;

  border-radius: 20px;

  padding: 30px;

  box-shadow:
    0 25px 60px rgba(15, 23, 42, 0.18),
    0 8px 25px rgba(15, 23, 42, 0.08);

  animation: modalEntrada 0.22s ease-out;
}

.logout-modal-icon {
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 20px;

  border-radius: 16px;

  background: #fff1f1;
  color: #c62828;
}

.logout-modal-content h2 {
  margin: 0;

  font-size: 22px;
  font-weight: 700;

  color: #172033;
}

.logout-modal-content p {
  margin: 10px 0 0;

  font-size: 14px;
  line-height: 1.6;

  color: #475467;
}

.logout-modal-content span {
  display: block;

  margin-top: 7px;

  font-size: 12px;
  line-height: 1.5;

  color: #98a2b3;
}

.logout-modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  gap: 10px;

  margin-top: 28px;
}

.logout-modal-actions button {
  min-height: 42px;

  border: none;
  border-radius: 10px;

  padding: 0 18px;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.logout-btn-cancel {
  background: #f4f6f8;
  color: #475467;
}

.logout-btn-cancel:hover {
  background: #e9edf2;
}

.logout-btn-cancel:active {
  transform: scale(0.97);
}

.logout-btn-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  background: #c62828;
  color: #ffffff;

  box-shadow: 0 5px 14px rgba(198, 40, 40, 0.18);
}

.logout-btn-confirm:hover {
  background: #b71c1c;

  box-shadow: 0 7px 18px rgba(198, 40, 40, 0.24);
}

.logout-btn-confirm:active {
  transform: scale(0.97);
}


/* ================================= */
/* ANIMACIÓN */
/* ================================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalEntrada {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


/* ================================= */
/* RESPONSIVE */
/* ================================= */

@media (max-width: 700px) {
  .header-toolbar {
    padding: 0 16px;
  }

  .user-info {
    display: none;
  }

  .header-title-sub {
    display: none;
  }

  .logout-modal {
    max-width: none;
    padding: 24px;
    border-radius: 18px;
  }

  .logout-modal-actions {
    flex-direction: column-reverse;
    width: 100%;
  }

  .logout-modal-actions button {
    width: 100%;
  }
}
</style>