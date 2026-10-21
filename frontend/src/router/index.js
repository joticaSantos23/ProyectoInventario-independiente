import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'

// =========================
// ADMIN
// =========================

import AdminLayout from '../layouts/admin/AdminLayout.vue'
import AdminPage from '../pages/AdminPage.vue'
import ProductosPage from '../pages/ProductosPage.vue'
import CategoriasPage from '../pages/CategoriasPage.vue'
import PrestamosPage from '../pages/PrestamosPage.vue'
import MovimientosPage from '../pages/MovimientosPage.vue'
import AprendicesPage from '../pages/AprendicesPage.vue'

// =========================
// APRENDIZ
// =========================

import AprendizLayout from '../pages/aprendiz/AprendizLayout.vue'
import CotizadorPage from '../pages/aprendiz/CotizadorPage.vue'
import InventarioAprendizPage from '../pages/aprendiz/InventarioAprendizPage.vue'
import SolicitarPrestamoPage from '../pages/aprendiz/SolicitarPrestamoPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // =========================
    // LOGIN
    // =========================

    {
      path: '/',
      name: 'login',
      component: LoginPage,
    },

    // =========================
    // ADMINISTRADOR
    // =========================

    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiereAutenticacion: true,
      },

      children: [
        {
          path: '',
          name: 'admin',
          component: AdminPage,
        },

        {
          path: 'productos',
          name: 'productos',
          component: ProductosPage,
        },

        {
          path: 'categorias',
          name: 'categorias',
          component: CategoriasPage,
        },

        {
          path: 'prestamos',
          name: 'prestamos',
          component: PrestamosPage,
        },

        {
          path: 'movimientos',
          name: 'movimientos',
          component: MovimientosPage,
        },

        {
          path: 'aprendices',
          name: 'aprendices',
          component: AprendicesPage,
        },
      ],
    },

    // =========================
    // APRENDIZ
    // =========================

    {
      path: '/aprendiz',
      component: AprendizLayout,
      meta: {
        requiereAutenticacion: true,
      },

      children: [
        {
          path: '',
          redirect: { name: 'cotizador' },
        },
        {
          path: 'cotizador',
          name: 'cotizador',
          component: CotizadorPage,
        },
        {
          path: 'inventario',
          name: 'inventario-aprendiz',
          component: InventarioAprendizPage,
        },
        {
          path: 'prestamos/solicitar',
          name: 'solicitar-prestamo-aprendiz',
          component: SolicitarPrestamoPage,
        },
        // Se elimina únicamente la pestaña Mis préstamos; su URL vuelve al cotizador.
        {
          path: 'prestamos',
          redirect: { name: 'cotizador' },
        },
      ],
    },
  ],
})

// =========================
// PROTECCIÓN DE RUTAS
// =========================

router.beforeEach((to) => {
  // La sesión ahora pertenece a cada pestaña
  const token = sessionStorage.getItem('token')

  if (to.meta.requiereAutenticacion && !token) {
    return { name: 'login' }
  }

  return true
})

export default router