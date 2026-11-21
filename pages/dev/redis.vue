<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver info sistema',
  subject: 'DevHerramienta',
})

const { get, deleted } = useClienteRequest()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const stats = ref<Record<string, any>>({})
const claves = ref<any[]>([])
const total = ref(0)
const cargando = ref(false)
const busqueda = ref('')
const tipoFiltro = ref<string | null>(null)
const claveExpandida = ref<string | null>(null)

const tipos = ['string', 'hash', 'list', 'set', 'zset']

const cargar = async () => {
  cargando.value = true
  try {
    const resp = await get('api/dev/redis')
    stats.value = resp.data.stats
    claves.value = resp.data.claves
    total.value = resp.data.total
  }
  catch {
    showToastError('No se pudo conectar a Redis')
  }
  finally {
    cargando.value = false
  }
}

const clavesFiltradas = computed(() => {
  let resultado = claves.value
  if (tipoFiltro.value)
    resultado = resultado.filter(c => c.tipo === tipoFiltro.value)
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    resultado = resultado.filter(c => c.clave.toLowerCase().includes(q))
  }
  return resultado
})

const colorTipo = (tipo: string) => {
  const mapa: Record<string, string> = {
    string: 'primary',
    hash: 'success',
    list: 'warning',
    set: 'info',
    zset: 'secondary',
  }
  return mapa[tipo] ?? 'default'
}

const formatTtl = (ttl: number) => {
  if (ttl === -1) return 'Sin exp.'
  if (ttl === -2) return 'Expirado'
  if (ttl < 60) return `${ttl}s`
  if (ttl < 3600) return `${Math.round(ttl / 60)}m`
  return `${Math.round(ttl / 3600)}h`
}

const formatValor = (item: any) => {
  if (item.valor === null || item.valor === undefined) return '(vacío)'
  if (typeof item.valor === 'string') return item.valor
  return JSON.stringify(item.valor, null, 2)
}

const borrarClave = async (clave: string) => {
  const ok = await preguntaEliminar(`¿Eliminar la clave "${clave}"?`)
  if (!ok) return
  try {
    await deleted(`api/dev/redis/${encodeURIComponent(clave)}`)
    showToastSuccess('Clave eliminada')
    claves.value = claves.value.filter(c => c.clave !== clave)
    total.value--
  }
  catch {
    showToastError('Error al eliminar la clave')
  }
}

const toggleExpand = (clave: string) => {
  claveExpandida.value = claveExpandida.value === clave ? null : clave
}

onMounted(() => cargar())
</script>

<template>
  <VRow>
    <!-- Estadísticas Redis -->
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-4">
          <span>
            <VIcon class="me-2" icon="ri-database-2-line" color="error" />
            Redis Viewer
          </span>
          <div class="d-flex gap-2 align-center">
            <VChip color="secondary" variant="tonal" size="small">
              {{ total }} claves
            </VChip>
            <VBtn size="small" variant="tonal" prepend-icon="ri-refresh-line" :loading="cargando" @click="cargar">
              Actualizar
            </VBtn>
          </div>
        </VCardTitle>

        <!-- Stats row -->
        <VCardText v-if="Object.keys(stats).length">
          <VRow dense>
            <VCol v-for="(val, key) in stats" :key="key" cols="6" sm="4" md="2">
              <VCard variant="tonal" color="primary" class="text-center pa-3">
                <div class="text-caption text-medium-emphasis text-uppercase mb-1">{{ key.replace(/_/g, ' ') }}</div>
                <div class="text-body-1 font-weight-bold">{{ val }}</div>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Filtros y tabla de claves -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VRow class="mb-4">
            <VCol cols="12" md="6">
              <VTextField
                v-model="busqueda"
                prepend-inner-icon="ri-search-line"
                placeholder="Buscar clave..."
                density="compact"
                hide-details
                clearable
              />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model="tipoFiltro"
                :items="tipos"
                label="Tipo"
                density="compact"
                hide-details
                clearable
              />
            </VCol>
            <VCol cols="12" md="2" class="d-flex align-center">
              <VChip v-if="tipoFiltro || busqueda" variant="tonal" color="warning" size="small">
                {{ clavesFiltradas.length }} resultados
              </VChip>
            </VCol>
          </VRow>

          <div v-if="cargando" class="d-flex justify-center py-10">
            <VProgressCircular indeterminate />
          </div>

          <div v-else-if="clavesFiltradas.length === 0" class="text-center py-8 text-secondary">
            No hay claves
          </div>

          <div v-else>
            <div
              v-for="item in clavesFiltradas"
              :key="item.clave"
              class="redis-row"
            >
              <!-- Fila principal -->
              <div class="d-flex align-center gap-2 pa-2 redis-row-header" @click="toggleExpand(item.clave)">
                <VChip :color="colorTipo(item.tipo)" size="x-small" variant="tonal" class="text-uppercase">
                  {{ item.tipo }}
                </VChip>
                <span class="redis-key font-weight-medium flex-grow-1">{{ item.clave }}</span>
                <VChip size="x-small" variant="outlined" :color="item.ttl === -1 ? 'success' : item.ttl > 0 ? 'warning' : 'error'">
                  {{ formatTtl(item.ttl) }}
                </VChip>
                <VBtn
                  v-if="can('limpiar logs sistema', 'DevHerramienta')"
                  icon="ri-delete-bin-line"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click.stop="borrarClave(item.clave)"
                />
                <VIcon :icon="claveExpandida === item.clave ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" size="16" />
              </div>

              <!-- Valor expandido -->
              <VExpandTransition>
                <div v-if="claveExpandida === item.clave" class="redis-value pa-2">
                  <pre class="redis-pre">{{ formatValor(item) }}</pre>
                </div>
              </VExpandTransition>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.redis-row {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  margin-bottom: 4px;
  overflow: hidden;
}

.redis-row-header {
  cursor: pointer;
  transition: background 0.15s;
}

.redis-row-header:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.redis-key {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}

.redis-value {
  background: #0d1117;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.redis-pre {
  color: #74c0fc;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}
</style>
