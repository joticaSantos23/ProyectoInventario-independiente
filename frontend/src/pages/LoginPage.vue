<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const correo = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)

const ingresar = async () => {
  if (!correo.value.trim() || !password.value) {
    $q.notify({
      type: 'negative',
      message: 'Completa el correo y la contraseña.',
      position: 'top-right',
      timeout: 3000,
    })
    return
  }

  cargando.value = true

  try {
    const respuesta = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: correo.value.trim(),
        password: password.value,
      }),
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No fue posible iniciar sesión.')
    }

    // ==============================
    // SESIÓN POR PESTAÑA
    // ==============================

    sessionStorage.setItem('token', datos.token)
    sessionStorage.setItem('usuario', JSON.stringify(datos.usuario))
    console.log('DATOS LOGIN:', datos)
console.log('TOKEN RECIBIDO:', datos.token)
console.log('TOKEN GUARDADO:', sessionStorage.getItem('token'))
console.log('USUARIO GUARDADO:', sessionStorage.getItem('usuario'))

    $q.notify({
      type: 'positive',
      message: `Bienvenido, ${datos.usuario.nombre}.`,
      position: 'top-right',
      timeout: 2500,
    })

    if (datos.usuario.rol === 'admin') {
      router.push('/admin')
    } else if (datos.usuario.rol === 'aprendiz') {
      router.push('/aprendiz')
    } else {
      throw new Error('El usuario no tiene un rol válido.')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al iniciar sesión.',
      position: 'top-right',
      timeout: 3500,
    })
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-background"></div>

    <main class="login-container">
      <section class="login-card">
        <div class="brand">
          <div class="brand-icon">
            <q-icon name="inventory_2" size="34px" />
          </div>

          <div>
            <h1>Inventario</h1>
            <p>Sistema de gestión de préstamos</p>
          </div>
        </div>

        <div class="login-heading">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <q-form @submit.prevent="ingresar" class="login-form">
          <q-input
            v-model="correo"
            type="text"
            label="Usuario o correo electrónico"
            placeholder="usuario o correo@ejemplo.com"
            outlined
            autocomplete="username"
            :disable="cargando"
          >
            <template #prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            outlined
            autocomplete="current-password"
            :disable="cargando"
          >
            <template #prepend>
              <q-icon name="lock_outline" />
            </template>

            <template #append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            unelevated
            no-caps
            class="login-button"
            :loading="cargando"
            :disable="cargando"
          >
            <q-icon name="login" size="20px" class="q-mr-sm" />
            Ingresar
          </q-btn>
        </q-form>

        <div class="login-footer">
          <q-icon name="security" size="18px" />
          <span>Acceso seguro al sistema</span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f7fb;
}

.login-background {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(25, 118, 210, 0.12), transparent 30%),
    radial-gradient(circle at 85% 80%, rgba(0, 150, 136, 0.1), transparent 32%);
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 32px 20px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(20, 35, 55, 0.08);
  border-radius: 24px;
  padding: 42px;
  box-shadow: 0 24px 70px rgba(15, 35, 60, 0.12);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 42px;
}

.brand-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1976d2;
  color: white;
}

.brand h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  color: #172033;
}

.brand p {
  margin: 3px 0 0;
  font-size: 13px;
  color: #718096;
}

.login-heading {
  margin-bottom: 28px;
}

.login-heading h2 {
  margin: 0 0 7px;
  font-size: 30px;
  font-weight: 700;
  color: #172033;
}

.login-heading p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-button {
  width: 100%;
  min-height: 52px;
  margin-top: 6px;
  border-radius: 12px;
  background: #1976d2;
  color: white;
  font-size: 15px;
  font-weight: 600;
}

.login-footer {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #8792a2;
  font-size: 12px;
}

@media (max-width: 520px) {
  .login-container {
    padding: 20px 14px;
  }

  .login-card {
    padding: 30px 22px;
    border-radius: 20px;
  }

  .brand {
    margin-bottom: 32px;
  }

  .login-heading h2 {
    font-size: 26px;
  }
}
</style>