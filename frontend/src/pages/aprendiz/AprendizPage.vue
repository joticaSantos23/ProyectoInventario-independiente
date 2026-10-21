<script setup>
import { computed } from 'vue'
const usuario = computed(() => {
  try { return JSON.parse(sessionStorage.getItem('usuario') || '{}') }
  catch { return {} }
})
const nombreUsuario = computed(() => usuario.value.nombre || 'Aprendiz')
</script>

<template>
  <q-page class="aprendiz-page">
    <section class="welcome-section">
      <span class="eyebrow">PORTAL DEL APRENDIZ</span>
      <h1>Bienvenido, {{ nombreUsuario }}</h1>
      <p>Utiliza el cotizador para seleccionar materiales, convertir medidas y descargar una cotización en PDF. Las cotizaciones no crean préstamos ni descuentan existencias.</p>
      <q-btn color="primary" icon="calculate" label="Abrir cotizador" to="/aprendiz/cotizador" />
    </section>
  </q-page>
</template>

<style scoped>
.aprendiz-page { padding: 32px; background: #f4f7fb; min-height: calc(100vh - 72px); }
.welcome-section { max-width: 860px; padding: 32px; background: #fff; border: 1px solid #e2e7ef; border-radius: 16px; }
.eyebrow { display: block; margin-bottom: 10px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #3157a6; }
.welcome-section h1 { margin: 0; color: #172033; font-size: clamp(26px, 3vw, 34px); }
.welcome-section p { margin: 12px 0 22px; max-width: 700px; color: #718096; line-height: 1.6; }
@media (max-width: 600px) { .aprendiz-page { padding: 14px; } .welcome-section { padding: 20px; } }
</style>
