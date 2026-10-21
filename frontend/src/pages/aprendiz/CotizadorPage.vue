<template>
  <main class="cotizador">
    <header class="encabezado no-print">
      <div>
        <p class="etiqueta">INVENTARIO · COTIZACIÓN</p>
        <h1>Cotizador de cableado y materiales</h1>
        <p class="subtitulo">Selecciona materiales, consulta sus detalles y descarga una cotización en PDF. No se imprime ni se descuenta inventario.</p>
      </div>
      <button class="btn principal" :disabled="cotizacion.length === 0" @click="abrirVistaPrevia">Vista previa PDF</button>
    </header>


    <div v-if="cargando" class="aviso no-print">Cargando productos del inventario…</div>
    <div v-else-if="error" class="aviso error no-print">
      <span>{{ error }}</span><button class="btn" @click="cargarProductos">Reintentar</button>
    </div>

    <div v-else class="rejilla no-print">
      <section class="panel">
        <div class="panel-titulo">
          <div><h2>Materiales disponibles</h2><p>La cantidad se convierte automáticamente al cambiar la unidad.</p></div>
          <span class="contador">{{ productosFiltrados.length }} productos</span>
        </div>
        <input v-model="busqueda" class="buscador" placeholder="Buscar por código, nombre o descripción…" />

        <div v-if="productosFiltrados.length" class="lista-productos">
          <article v-for="producto in productosFiltrados" :key="idProducto(producto)" class="producto" :class="{ 'producto-seleccionado': idProducto(productoSeleccionado || {}) === idProducto(producto) }">
            <div class="producto-cabecera">
              <div><span class="codigo">{{ producto.codigo || 'SIN CÓDIGO' }}</span><h3>{{ producto.nombre }}</h3><p v-if="producto.descripcion">{{ producto.descripcion }}</p></div>
              <span class="stock">{{ producto.consumible ? 'Consumible · cantidad libre' : `Disponible: ${formatoCantidad(Number(producto.stock || 0))} ${unidadBase(producto)}` }}</span>
            </div>
            <button class="btn ver-detalles" type="button" @click="mostrarDetalles(producto)">{{ idProducto(productoSeleccionado || {}) === idProducto(producto) ? 'Información abierta' : 'Ver información del producto' }}</button>
            <div class="controles">
              <label class="campo cantidad-campo"><span>Cantidad necesaria</span><input type="number" min="0.000001" step="any" v-model.number="entradas[idProducto(producto)].cantidad" @input="actualizarConversion(producto)" /></label>
              <label class="campo"><span>Unidad</span><select  :value="entradas[idProducto(producto)].unidad" @change="cambiarUnidad(producto, $event.target.value)"><option v-for="unidad in unidadesCompatibles(producto)" :key="unidad" :value="unidad">{{ etiquetaUnidad(unidad) }}</option></select></label>
              <div class="conversion"><span>Equivale a</span><strong>{{ formatoCantidad(cantidadBaseEntrada(producto)) }} {{ unidadBase(producto) }}</strong></div>
              <button class="btn principal agregar" @click="agregar(producto)">Agregar</button>
            </div>
            <p v-if="mensajeProducto[idProducto(producto)]" class="mensaje-error">{{ mensajeProducto[idProducto(producto)] }}</p>
          </article>
        </div>
        <div v-else class="vacio">No se encontraron productos con esa búsqueda.</div>
        <!-- El detalle se muestra en una ventana independiente para que siempre sea visible. -->
      </section>

      <aside class="panel resumen">
        <div class="panel-titulo"><div><h2>Materiales solicitados</h2><p>El cotizador no crea ni descuenta préstamos del inventario.</p></div></div>
        <div v-if="!cotizacion.length" class="vacio">Agrega productos para armar tu cotización.</div>
        <div v-else class="items">
          <article v-for="item in cotizacion" :key="item.id" class="item">
            <div class="item-cabecera"><div><strong>{{ item.nombre }}</strong><small>{{ item.codigo }}</small></div><button class="quitar" title="Quitar producto" @click="quitar(item.id)">×</button></div>
            <div class="detalle">{{ formatoCantidad(item.cantidad) }} {{ item.unidad }} · {{ formatoMoneda(item.precioUnitario) }} por {{ item.unidadBase }}</div>
            <div class="item-total">{{ formatoMoneda(item.subtotal) }}</div>
          </article>
          <section class="mano-obra">
            <h3>Mano de obra</h3>
            <label class="campo">
              <span>Cantidad de personas</span>
              <input v-model.number="cantidadPersonas" type="number" min="1" step="1" />
            </label>
            <label class="campo">
              <span>Valor total de mano de obra (COP)</span>
              <input v-model.number="costoManoObra" type="number" min="0" step="1000" placeholder="Ej. 150000" />
            </label>
            <p>Ingresa el costo total del trabajo, no el valor por persona.</p>
          </section>
          <div class="total">
            <span>Subtotal materiales</span>
            <strong>{{ formatoMoneda(subtotalMateriales) }}</strong>
          </div>
          <div class="total">
            <span>Mano de obra ({{ personasManoObra }} {{ personasManoObra === 1 ? 'persona' : 'personas' }})</span>
            <strong>{{ formatoMoneda(manoObraTotal) }}</strong>
          </div>
          <div class="total">
            <span>Total estimado (sin IVA)</span>
            <strong>{{ formatoMoneda(total) }}</strong>
          </div>
          <button class="btn principal ancho" @click="abrirVistaPrevia">Vista previa PDF</button>
          <button class="btn ancho" @click="limpiar">Vaciar cotización</button>
        </div>
      </aside>
    </div>

    <div v-if="productoSeleccionado" class="producto-dialog-overlay" role="presentation" @click.self="productoSeleccionado = null">
      <section class="panel detalles-producto producto-dialog" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle-producto">
        <div class="panel-titulo">
          <div><h2 id="titulo-detalle-producto">Información del producto</h2><p>Detalles del material seleccionado.</p></div>
          <button class="btn" type="button" @click="productoSeleccionado = null">Cerrar</button>
        </div>
        <div class="detalle-grid">
          <div><span>Código</span><strong>{{ productoSeleccionado.codigo || '—' }}</strong></div>
          <div><span>Nombre</span><strong>{{ productoSeleccionado.nombre || '—' }}</strong></div>
          <div><span>Marca</span><strong>{{ productoSeleccionado.marca || '—' }}</strong></div>
          <div><span>Modelo</span><strong>{{ productoSeleccionado.modelo || '—' }}</strong></div>
          <div><span>Categoría</span><strong>{{ nombreCategoria(productoSeleccionado) }}</strong></div>
          <div><span>Unidad base</span><strong>{{ etiquetaUnidad(unidadBase(productoSeleccionado)) }}</strong></div>
          <div><span>Stock disponible</span><strong>{{ formatoCantidad(Number(productoSeleccionado.stock || 0)) }} {{ unidadBase(productoSeleccionado) }}</strong></div>
          <div><span>Valor registrado</span><strong>{{ formatoMoneda(Number(productoSeleccionado.precio || 0)) }}</strong></div>
          <div><span>Valor por unidad</span><strong>{{ formatoMoneda(Number(productoSeleccionado.stock || 0) > 0 ? Number(productoSeleccionado.precio || 0) / Number(productoSeleccionado.stock) : 0) }} / {{ unidadBase(productoSeleccionado) }}</strong></div>
          <div class="detalle-completo"><span>Descripción</span><strong>{{ productoSeleccionado.descripcion || 'Sin descripción registrada.' }}</strong></div>
        </div>
      </section>
    </div>

    <div v-if="vistaPreviaAbierta" class="pdf-modal-overlay" role="presentation" @click.self="cerrarVistaPrevia">
      <section class="pdf-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-vista-previa">
        <header class="pdf-modal-header">
          <div><h2 id="titulo-vista-previa">Vista previa de la cotización</h2><p>Revisa el documento antes de descargarlo.</p></div>
          <button class="btn" type="button" @click="cerrarVistaPrevia">Cerrar</button>
        </header>
        <iframe v-if="pdfPreviewUrl" class="pdf-frame" :src="pdfPreviewUrl" title="Vista previa PDF de la cotización"></iframe>
        <footer class="pdf-modal-footer">
          <button class="btn" type="button" @click="cerrarVistaPrevia">Volver al cotizador</button>
          <button class="btn principal" type="button" @click="descargarPDF">Descargar PDF</button>
        </footer>
      </section>
    </div>

  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../services/api'

const productos = ref([])
const cotizacion = ref([])
const entradas = reactive({})
const mensajeProducto = reactive({})
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')
const productoSeleccionado = ref(null)
const vistaPreviaAbierta = ref(false)
const pdfPreviewUrl = ref('')

const grupos = {
  longitud: { km: 1000, hm: 100, dam: 10, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, um: 0.000001, mi: 1609.344 },
  volumen: { kL: 1000, hL: 100, daL: 10, L: 1, dL: 0.1, cL: 0.01, mL: 0.001, ml: 0.001 },
  masa: { t: 1000, kg: 1, hg: 0.1, dag: 0.01, g: 0.001, dg: 0.0001, cg: 0.00001, mg: 0.000001 },
  unidad: { unidad: 1 },
}
const grupoUnidad = (unidad) => Object.keys(grupos).find((grupo) => Object.hasOwn(grupos[grupo], unidad)) || 'unidad'
const idProducto = (producto) => String(producto._id || producto.id || producto.codigo)
const unidadBase = (producto) => producto.unidadMedida || 'unidad'
const unidadesCompatibles = (producto) => Object.keys(grupos[grupoUnidad(unidadBase(producto))] || grupos.unidad)
const etiquetaUnidad = (unidad) => ({ unidad: 'Unidades (und)', km: 'Kilómetros (km)', hm: 'Hectómetros (hm)', dam: 'Decámetros (dam)', m: 'Metros (m)', dm: 'Decímetros (dm)', cm: 'Centímetros (cm)', mm: 'Milímetros (mm)', um: 'Micrómetros (µm)', mi: 'Millas (mi)', kL: 'Kilolitros (kL)', ml: 'Mililitros (ml)', hL: 'Hectolitros (hL)', daL: 'Decalitros (daL)', L: 'Litros (L)', dL: 'Decilitros (dL)', cL: 'Centilitros (cL)', mL: 'Mililitros (mL)', t: 'Toneladas (t)', kg: 'Kilogramos (kg)', hg: 'Hectogramos (hg)', dag: 'Decagramos (dag)', g: 'Gramos (g)', dg: 'Decigramos (dg)', cg: 'Centigramos (cg)', mg: 'Miligramos (mg)' })[unidad] || unidad
const formatoCantidad = (valor) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 4 }).format(Number.isFinite(Number(valor)) ? Number(valor) : 0)
const formatoMoneda = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(valor) || 0)
const fechaActual = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date())
const nombreAprendiz = () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) return sessionStorage.getItem('nombre') || 'Aprendiz'
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.nombre || payload.name || payload.usuario || payload.correo || sessionStorage.getItem('nombre') || 'Aprendiz'
  } catch { return sessionStorage.getItem('nombre') || 'Aprendiz' }
}
const mostrarDetalles = (producto) => { productoSeleccionado.value = producto }
const nombreCategoria = (producto) => {
  if (producto?.categoria && typeof producto.categoria === 'object') return producto.categoria.nombre || producto.categoria.name || 'Categoría registrada'
  return producto?.categoriaNombre || (producto?.categoria ? 'Categoría registrada' : '—')
}

const cargarProductos = async () => {
  cargando.value = true
  error.value = ''
  try {
    const resultado = await api.obtenerProductos()
    productos.value = (Array.isArray(resultado) ? resultado : []).filter((p) => p.activo !== false && p.estado !== 'Retirado')
    for (const producto of productos.value) {
      const id = idProducto(producto)
      if (!entradas[id]) entradas[id] = { cantidad: 1, unidad: unidadBase(producto) }
    }
  } catch (err) {
    error.value = err?.message || 'No fue posible cargar los productos.'
  } finally {
    cargando.value = false
  }
}

const productosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLowerCase()
  if (!termino) return productos.value
  return productos.value.filter((p) => [p.codigo, p.nombre, p.descripcion].some((v) => String(v || '').toLowerCase().includes(termino)))
})
const cantidadBaseEntrada = (producto) => {
  const entrada = entradas[idProducto(producto)] || { cantidad: 0, unidad: unidadBase(producto) }
  const factorEntrada = grupos[grupoUnidad(entrada.unidad)]?.[entrada.unidad] || 1
  const factorBase = grupos[grupoUnidad(unidadBase(producto))]?.[unidadBase(producto)] || 1
  return Math.max(0, Number(entrada.cantidad) || 0) * factorEntrada / factorBase
}
const actualizarConversion = (producto) => { delete mensajeProducto[idProducto(producto)] }
const cambiarUnidad = (producto, nuevaUnidad) => {
  const entrada = entradas[idProducto(producto)]
  // Calcula la cantidad física con la unidad anterior antes de cambiarla.
  const base = cantidadBaseEntrada(producto)
  entrada.unidad = nuevaUnidad
  const factorSeleccionado = grupos[grupoUnidad(nuevaUnidad)]?.[nuevaUnidad] || 1
  const factorBase = grupos[grupoUnidad(unidadBase(producto))]?.[unidadBase(producto)] || 1
  entrada.cantidad = Number((base * factorBase / factorSeleccionado).toFixed(6))
  actualizarConversion(producto)
}
const agregar = (producto) => {
  const id = idProducto(producto)
  const entrada = entradas[id]
  const cantidadBase = cantidadBaseEntrada(producto)
  const stock = Number(producto.stock || 0)
  if (!Number.isFinite(cantidadBase) || cantidadBase <= 0) { mensajeProducto[id] = 'Ingresa una cantidad mayor que cero.'; return }
  if (!producto.consumible && cantidadBase > stock + 1e-9) { mensajeProducto[id] = `La cantidad supera el stock disponible (${formatoCantidad(stock)} ${unidadBase(producto)}).`; return }
  // El precio registrado representa el valor del stock disponible; se calcula el valor por unidad base.
  const precioUnitario = stock > 0 ? Number(producto.precio || 0) / stock : 0
  const subtotal = precioUnitario * cantidadBase
  const existente = cotizacion.value.find((item) => item.id === id)
  const unidad = entrada.unidad
  const cantidadMostrada = Number(entrada.cantidad)
  if (existente) {
    const nuevaCantidadBase = existente.cantidadBase + cantidadBase
    if (!producto.consumible && nuevaCantidadBase > stock + 1e-9) { mensajeProducto[id] = 'La suma de las cantidades supera el stock disponible.'; return }
    existente.cantidadBase = nuevaCantidadBase
    existente.cantidad = nuevaCantidadBase
    existente.unidad = existente.unidadBase
    existente.subtotal = existente.cantidadBase * existente.precioUnitario
  } else {
    cotizacion.value.push({ id, codigo: producto.codigo || '', nombre: producto.nombre, cantidad: cantidadBase, unidad: unidadBase(producto), cantidadBase, unidadBase: unidadBase(producto), precioUnitario, subtotal })
  }
  delete mensajeProducto[id]
}
const quitar = (id) => { cotizacion.value = cotizacion.value.filter((item) => item.id !== id) }
const limpiar = () => { cotizacion.value = [] }
const cantidadPersonas = ref(1)
const costoManoObra = ref(0)
const subtotalMateriales = computed(() =>
  cotizacion.value.reduce((suma, item) => suma + item.subtotal, 0)
)
const personasManoObra = computed(() =>
  Math.max(1, Math.floor(Number(cantidadPersonas.value) || 1))
)
const manoObraTotal = computed(() =>
  Math.max(0, Number(costoManoObra.value) || 0)
)
const total = computed(() => subtotalMateriales.value + manoObraTotal.value)

const crearPDFBlob = () => {
  if (!cotizacion.value.length) return

  const escapar = (texto) =>
    String(texto ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')

  const winAnsi = (texto) => {
    const mapa = {
      '€': 128, '‚': 130, 'ƒ': 131, '„': 132, '…': 133,
      '†': 134, '‡': 135, 'ˆ': 136, '‰': 137, 'Š': 138,
      '‹': 139, 'Œ': 140, 'Ž': 142, '‘': 145, '’': 146,
      '“': 147, '”': 148, '•': 149, '–': 150, '—': 151,
      '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156,
      'ž': 158, 'Ÿ': 159
    }

    const normalizado = String(texto ?? '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')

    return new Uint8Array(
      [...normalizado].map((caracter) => {
        const codigo = caracter.codePointAt(0)
        if (codigo <= 255) return codigo
        return mapa[caracter] ?? 63
      })
    )
  }

  const limitar = (texto, maximo) => {
    const valor = String(texto ?? '')
    return valor.length > maximo
      ? `${valor.slice(0, maximo - 3)}...`
      : valor
  }

  const textoPDF = (x, y, tamano, texto, color = '0.12 0.18 0.28', fuente = 'F1') =>
    `BT /${fuente} ${tamano} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${escapar(texto)}) Tj ET\n`

  const rectangulo = (x, y, ancho, alto, color) =>
    `${color} rg ${x} ${y} ${ancho} ${alto} re f\n`

  const linea = (x1, y1, x2, y2, color = '0.86 0.89 0.93') =>
    `${color} RG ${x1} ${y1} m ${x2} ${y2} l S\n`

  const materiales = cotizacion.value
  const elementosPorPagina = 20
  const paginas = []

  for (let i = 0; i < materiales.length; i += elementosPorPagina) {
    paginas.push(materiales.slice(i, i + elementosPorPagina))
  }

  const objetos = []
  const offsets = [0]

  const pushObj = (contenido) => {
    objetos.push(contenido)
    return objetos.length
  }

  const fontId = pushObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  )

  const boldFontId = pushObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  )

  const pageIds = []
  const contentIds = []

  paginas.forEach((itemsPagina, indicePagina) => {
    let contenido = ''

    // Cabecera corporativa azul oscuro.
    contenido += rectangulo(42, 750, 511, 75, '0.08 0.17 0.34')
    contenido += rectangulo(42, 750, 6, 75, '0.20 0.43 0.82')

    contenido += textoPDF(
      60, 797, 18,
      'COTIZACION DE MATERIALES',
      '1 1 1', 'F2'
    )

    contenido += textoPDF(
      60, 775, 10,
      `Aprendiz: ${limitar(nombreAprendiz(), 55)}`,
      '0.91 0.94 0.99'
    )

    contenido += textoPDF(
      410, 775, 9,
      `Fecha: ${fechaActual}`,
      '0.91 0.94 0.99'
    )

    contenido += textoPDF(
      44, 730, 10,
      'Cotizacion personalizada de materiales',
      '0.12 0.18 0.28', 'F2'
    )

    contenido += textoPDF(
      44, 713, 9,
      'Valores en pesos colombianos (COP). Cotizacion sin IVA.',
      '0.35 0.40 0.48'
    )

    // Encabezados de la tabla.
    contenido += rectangulo(42, 680, 511, 24, '0.12 0.25 0.48')

    contenido += textoPDF(50, 689, 8, 'CODIGO', '1 1 1', 'F2')
    contenido += textoPDF(112, 689, 8, 'DESCRIPCION', '1 1 1', 'F2')
    contenido += textoPDF(307, 689, 8, 'CANTIDAD', '1 1 1', 'F2')
    contenido += textoPDF(375, 689, 8, 'VR. UNITARIO', '1 1 1', 'F2')
    contenido += textoPDF(478, 689, 8, 'SUBTOTAL', '1 1 1', 'F2')

    // Filas de materiales.
    itemsPagina.forEach((item, indice) => {
      const y = 658 - indice * 21
      const colorFondo = indice % 2 === 0
        ? '0.95 0.97 0.99'
        : '1 1 1'

      contenido += rectangulo(42, y - 7, 511, 21, colorFondo)
      contenido += linea(42, y - 7, 553, y - 7)

      contenido += textoPDF(
        50, y, 8,
        limitar(item.codigo || '-', 10)
      )

      contenido += textoPDF(
        112, y, 8,
        limitar(item.nombre, 34)
      )

      contenido += textoPDF(
        307, y, 8,
        `${formatoCantidad(item.cantidad)} ${item.unidad}`
      )

      contenido += textoPDF(
        375, y, 8,
        limitar(formatoMoneda(item.precioUnitario), 17)
      )

      contenido += textoPDF(
        478, y, 8,
        limitar(formatoMoneda(item.subtotal), 15),
        '0.12 0.25 0.48', 'F2'
      )
    })

    // Información inferior en la última página.
    if (indicePagina === paginas.length - 1) {
      contenido += linea(42, 190, 553, 190, '0.78 0.82 0.89')

      contenido += textoPDF(
        44, 171, 9,
        'SUBTOTAL MATERIALES',
        '0.35 0.40 0.48', 'F2'
      )
      contenido += textoPDF(
        400, 171, 9,
        formatoMoneda(subtotalMateriales.value),
        '0.12 0.18 0.28', 'F2'
      )

      contenido += textoPDF(
        44, 155, 9,
        `MANO DE OBRA - PERSONAS: ${personasManoObra.value}`,
        '0.35 0.40 0.48', 'F2'
      )
      contenido += textoPDF(
        400, 155, 9,
        formatoMoneda(manoObraTotal.value),
        '0.12 0.18 0.28', 'F2'
      )

      contenido += rectangulo(326, 108, 227, 39, '0.90 0.94 1')
      contenido += rectangulo(326, 108, 4, 39, '0.12 0.30 0.62')

      contenido += textoPDF(
        340, 131, 9,
        'TOTAL GENERAL (SIN IVA)',
        '0.12 0.25 0.48', 'F2'
      )

      contenido += textoPDF(
        340, 117, 12,
        formatoMoneda(total.value),
        '0.08 0.20 0.43', 'F2'
      )

      contenido += textoPDF(
        44, 83, 8,
        'Esta cotizacion no reserva materiales ni modifica las existencias.',
        '0.35 0.40 0.48'
      )    }

    contenido += linea(42, 58, 553, 58)

    contenido += textoPDF(
      44, 43, 8,
      `Sistema de inventario | Pagina ${indicePagina + 1} de ${paginas.length}`,
      '0.42 0.47 0.55'
    )

    const streamBytes = winAnsi(contenido)
    const contentId = pushObj({ streamBytes })
    contentIds.push(contentId)

    const pageId = pushObj('PAGE_PLACEHOLDER')
    pageIds.push(pageId)
  })

  const pagesId = pushObj('PAGES_PLACEHOLDER')

  pageIds.forEach((pageId, index) => {
    objetos[pageId - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R ` +
      `/MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> ` +
      `/Contents ${contentIds[index]} 0 R >>`
  })

  objetos[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

  const catalogId = pushObj(
    `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
  )

  const chunks = []
  let offset = 0

  const addBytes = (bytes) => {
    chunks.push(bytes)
    offset += bytes.length
  }

  const ascii = (valor) => new TextEncoder().encode(valor)

  addBytes(ascii('%PDF-1.4\n%PDFGEN\n'))

  objetos.forEach((obj, index) => {
    offsets.push(offset)

    if (typeof obj === 'object' && obj.streamBytes) {
      addBytes(
        ascii(`${index + 1} 0 obj\n<< /Length ${obj.streamBytes.length} >>\nstream\n`)
      )
      addBytes(obj.streamBytes)
      addBytes(ascii('\nendstream\nendobj\n'))
    } else {
      addBytes(ascii(`${index + 1} 0 obj\n${obj}\nendobj\n`))
    }
  })

  const xrefOffset = offset
  let xref = `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`

  for (let i = 1; i <= objetos.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }

  xref +=
    `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogId} 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`

  addBytes(ascii(xref))

  return new Blob(chunks, { type: 'application/pdf' })
}


const abrirVistaPrevia = () => {
  if (!cotizacion.value.length) return
  const blob = crearPDFBlob()
  if (!blob) return
  if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
  pdfPreviewUrl.value = URL.createObjectURL(blob)
  vistaPreviaAbierta.value = true
}

const descargarPDF = () => {
  const blob = crearPDFBlob()
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `cotizacion-materiales-${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

const cerrarVistaPrevia = () => {
  vistaPreviaAbierta.value = false
  if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
  pdfPreviewUrl.value = ''
}

onMounted(cargarProductos)
</script>

<style scoped>
* { box-sizing: border-box; }
.cotizador { padding: 26px; color: #1d2939; background: #f5f7fb; min-height: 100%; }
.encabezado { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:24px; }
.etiqueta { margin:0 0 6px; font-size:11px; letter-spacing:1.3px; font-weight:800; color:#3157a6; }
h1 { margin:0; font-size:clamp(24px,3vw,34px); }
.subtitulo { margin:8px 0 0; color:#667085; }
.rejilla { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(300px,.85fr); align-items:start; gap:20px; }
.panel { background:#fff; border:1px solid #e2e7ef; border-radius:15px; padding:20px; box-shadow:0 5px 18px #172b4d08; }
.panel-titulo { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; }
h2 { margin:0; font-size:19px; }
.panel-titulo p { margin:6px 0 0; color:#778196; font-size:13px; line-height:1.45; }
.contador { border-radius:20px; background:#eef3ff; color:#3157a6; padding:6px 10px; font-size:12px; white-space:nowrap; }
.buscador { width:100%; border:1px solid #d8dee8; border-radius:9px; padding:12px 13px; margin-bottom:14px; font:inherit; }
.lista-productos { display:flex; flex-direction:column; gap:12px; }
.producto { border:1px solid #e5e9f0; border-radius:12px; padding:15px; }
.producto-seleccionado { border-color:#3157a6; box-shadow:0 0 0 2px #3157a61a; }
.ver-detalles { margin-top:10px; padding:7px 10px; font-size:12px; }
.detalles-producto { margin-top:14px; }
.producto-dialog-overlay,.pdf-modal-overlay { position:fixed; inset:0; z-index:3000; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(16,24,40,.62); }
.producto-dialog { width:min(760px,100%); max-height:90vh; overflow:auto; }
.pdf-modal { width:min(1100px,100%); height:min(92vh,900px); display:flex; flex-direction:column; gap:12px; padding:18px; border-radius:15px; background:#fff; box-shadow:0 24px 70px #0003; }
.pdf-modal-header,.pdf-modal-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.pdf-modal-header h2 { margin:0; font-size:20px; }
.pdf-modal-header p { margin:5px 0 0; color:#667085; font-size:13px; }
.pdf-frame { width:100%; flex:1; min-height:300px; border:1px solid #d8dee8; border-radius:8px; background:#f2f4f7; }
@media(max-width:600px) { .producto-dialog-overlay,.pdf-modal-overlay { padding:8px; } .pdf-modal { height:95vh; padding:10px; } .pdf-modal-header,.pdf-modal-footer { align-items:stretch; flex-wrap:wrap; } }
.detalle-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.detalle-grid > div { display:flex; flex-direction:column; gap:5px; min-width:0; }
.detalle-grid span { color:#778196; font-size:11px; }
.detalle-grid strong { font-size:13px; overflow-wrap:anywhere; }
.detalle-grid .detalle-completo { grid-column:1/-1; }
.producto-cabecera { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.codigo { font-size:10px; color:#758198; letter-spacing:.8px; font-weight:800; }
h3 { margin:4px 0; font-size:15px; }
.producto p { margin:4px 0 0; color:#7a8597; font-size:12px; }
.stock { padding:6px 8px; background:#f0f8f3; color:#237347; border-radius:7px; font-size:11px; white-space:nowrap; }
.controles { display:grid; grid-template-columns:minmax(110px,1fr) minmax(120px,.8fr) minmax(120px,.9fr) auto; align-items:end; gap:10px; margin-top:16px; }
.campo { display:flex; flex-direction:column; gap:6px; min-width:0; }
.campo span,.conversion span { font-size:11px; color:#778196; }
.campo input,.campo select { width:100%; min-width:0; border:1px solid #d8dee8; border-radius:8px; padding:10px; background:#fff; font:inherit; }
.conversion { display:flex; flex-direction:column; gap:6px; padding-bottom:9px; }
.conversion strong { font-size:13px; color:#3157a6; }
.btn { border:1px solid #d6dce6; background:#fff; color:#344054; border-radius:9px; padding:10px 14px; font-weight:700; cursor:pointer; }
.btn:disabled { opacity:.45; cursor:not-allowed; }
.btn.principal { color:#fff; border-color:#3157a6; background:#3157a6; }
.btn.principal:hover:not(:disabled) { background:#27478e; }
.agregar { white-space:nowrap; }
@media (max-width:600px) { .detalle-grid { grid-template-columns:1fr; } .detalle-grid .detalle-completo { grid-column:auto; } }
.mensaje-error { color:#b42318 !important; margin-top:9px !important; }
.resumen { position:sticky; top:16px; max-height:calc(100vh - 32px); overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin; }
.resumen .items { padding-bottom:4px; }
@media(max-width:900px) { .resumen { position:static; max-height:none; overflow:visible; } .rejilla { grid-template-columns:1fr; } }
.items { display:flex; flex-direction:column; gap:12px; }
.item { padding:13px; border:1px solid #e5e9f0; border-radius:10px; }
.item-cabecera { display:flex; justify-content:space-between; gap:10px; }
.item-cabecera strong { display:block; font-size:13px; }
.item-cabecera small { display:block; margin-top:4px; color:#788397; }
.quitar { border:0; background:#fff0f0; color:#b42318; border-radius:6px; width:27px; height:27px; font-size:19px; cursor:pointer; }
.detalle { margin-top:10px; color:#667085; font-size:12px; }
.item-total { margin-top:8px; font-weight:800; }
.mano-obra { display:flex; flex-direction:column; gap:12px; padding:14px; border:1px solid #d8dee8; border-radius:10px; background:#f8faff; }
.mano-obra h3 { margin:0; }
.mano-obra p { margin:0; color:#778196; font-size:12px; line-height:1.45; }
.total { display:flex; justify-content:space-between; gap:12px; border-top:1px solid #e4e8ef; padding-top:16px; margin-top:5px; }
.total span { font-size:13px; font-weight:700; }
.total strong { color:#24488e; font-size:18px; }
.ancho { width:100%; }
.vacio,.aviso { padding:25px 15px; color:#778196; text-align:center; border:1px dashed #d7deea; border-radius:10px; }
.aviso { margin-bottom:18px; }.aviso.error { color:#b42318; display:flex; justify-content:center; align-items:center; gap:12px; }
</style>
