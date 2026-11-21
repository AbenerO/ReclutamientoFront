<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'ver logs sistema',
  subject: 'DevHerramienta',
})

const route  = useRouter().currentRoute.value
const router = useRouter()
const { get } = useClienteRequest()

const CANALES_VALIDOS = ['laravel', 'frontend']
const NIVELES_VALIDOS = ['all', 'error', 'warning', 'notice', 'info', 'debug']

const fecha        = computed(() => useRoute().params.fecha as string)
const tipoEntorno  = ref(CANALES_VALIDOS.includes(route.query.channel as string) ? (route.query.channel as string) : 'laravel')
const currentTab   = ref(NIVELES_VALIDOS.includes(route.query.level as string) ? (route.query.level as string) : 'all')
const page         = ref(1)
const itemsPerPage = ref(10)
const cargando     = ref(false)

interface LogEntry {
  datetime: string | null
  level: string
  header: string
  stack: string | null
  context: Record<string, any> | null
  uid?: string
  canExpand?: boolean
}

interface LogsResponse {
  date: string
  environment: string
  logs: LogEntry[]
  stats: Record<string, number>
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

const Logs = ref<LogsResponse | null>(null)

// ── Nivel / color / ícono ─────────────────────────────────────────────────────
const nivelConfig: Record<string, { color: string; icon: string; label: string }> = {
  all:     { color: 'default',   icon: 'ri-list-check-3',      label: 'Todos' },
  error:   { color: 'error',     icon: 'ri-close-circle-line', label: 'Error' },
  warning: { color: 'warning',   icon: 'ri-error-warning-line',label: 'Warning' },
  notice:  { color: 'info',      icon: 'ri-information-line',  label: 'Notice' },
  info:    { color: 'primary',   icon: 'ri-information-line',  label: 'Info' },
  debug:   { color: 'secondary', icon: 'ri-bug-2-line',        label: 'Debug' },
}
const getLevelColor = (l: string) => nivelConfig[l]?.color ?? 'default'
const getLevelIcon  = (l: string) => nivelConfig[l]?.icon  ?? 'ri-circle-line'

// ── Carga ─────────────────────────────────────────────────────────────────────
const getLogs = async () => {
  cargando.value = true
  try {
    const qs = `channel=${encodeURIComponent(tipoEntorno.value)}&level=${encodeURIComponent(currentTab.value)}&page[number]=${page.value}&page[size]=${itemsPerPage.value}`
    const res = await get(`api/configuracion/log-viewer/logs/${fecha.value}?${qs}`)
    Logs.value = (res as any)?.data ?? null
  } catch {
    Logs.value = null
  } finally {
    cargando.value = false
  }
}

// Sincronizar URL al cambiar canal/nivel
watch([tipoEntorno, currentTab], () => {
  page.value = 1
  router.replace({ query: { channel: tipoEntorno.value, level: currentTab.value } })
})

watch([tipoEntorno, currentTab, page, itemsPerPage], getLogs, { immediate: true })

// ── Items con uid ─────────────────────────────────────────────────────────────
const logsFiltered = computed(() =>
  (Logs.value?.logs ?? []).map((log, i) => ({
    ...log,
    uid: `${page.value}-${i}`,
    canExpand: !!(log.context || log.stack),
  }))
)

// ── Filas expandidas ──────────────────────────────────────────────────────────
const expanded = ref<string[]>([])

const toggleRow = (uid: string) => {
  expanded.value = expanded.value.includes(uid)
    ? expanded.value.filter(u => u !== uid)
    : [...expanded.value, uid]
}

// ── JSON bonito ───────────────────────────────────────────────────────────────
const jsonBonito = (v: any) => JSON.stringify(v, null, 2)

// ── Stack trace frontend ──────────────────────────────────────────────────────
const formatStack = (stack: string) => stack.replace(/ \| /g, '\n')

// ── Opciones de filas por página ──────────────────────────────────────────────
const opcionesPorPagina = [10, 25, 50, 100]

const pag = computed(() => Logs.value?.pagination)
</script>

<template>
  <VRow>
    <!-- Header -->
    <VCol cols="12">
      <VCard>
        <VCardText class="py-3">
          <div class="d-flex align-center gap-3 flex-wrap">
            <VBtn
              size="small" variant="text" icon="ri-arrow-left-line"
              @click="router.push('/dev/log')"
            />
            <VIcon icon="ri-file-text-line" size="20" color="primary" />
            <span class="text-h6 font-weight-medium">Logs del {{ fecha }}</span>
            <VChip size="small" variant="tonal" color="secondary">{{ Logs?.environment ?? '' }}</VChip>
            <VSpacer />
            <VBtn
              size="small" variant="tonal" prepend-icon="ri-refresh-line"
              :loading="cargando" @click="getLogs"
            >Actualizar</VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Tabs de canal -->
    <VCol cols="12">
      <VTabs v-model="tipoEntorno" density="compact">
        <VTab value="laravel">
          <VIcon icon="ri-server-line" size="16" class="me-2" />
          Backend
        </VTab>
        <VTab value="frontend">
          <VIcon icon="ri-computer-line" size="16" class="me-2" />
          Frontend
        </VTab>
      </VTabs>
    </VCol>

    <!-- Tabs de nivel -->
    <VCol cols="12">
      <VTabs v-model="currentTab" density="compact">
        <VTab v-for="nv in NIVELES_VALIDOS" :key="nv" :value="nv">
          <VIcon :icon="getLevelIcon(nv)" size="14" class="me-1" />
          {{ nivelConfig[nv].label }}
          <VBadge
            v-if="Logs?.stats?.[nv] && nv !== 'all'"
            :content="Logs.stats[nv]"
            :color="getLevelColor(nv)"
            inline class="ms-2"
          />
        </VTab>
      </VTabs>
    </VCol>

    <!-- Tabla -->
    <VCol cols="12">
      <VCard>
        <VDataTable
          :headers="[
            { title: 'Fecha/Hora', key: 'datetime', width: '175px', sortable: false },
            { title: 'Nivel',      key: 'level',     width: '110px', sortable: false },
            { title: 'Mensaje',    key: 'header',    sortable: false },
          ]"
          :items="logsFiltered"
          :items-per-page="-1"
          :loading="cargando"
          item-value="uid"
          v-model:expanded="expanded"
          :row-props="({ item }: any) => item.canExpand
            ? { class: 'log-row-clickable', onClick: () => toggleRow(item.uid) }
            : {}"
          hover
        >
          <!-- Fecha -->
          <template #item.datetime="{ item }">
            <span class="text-caption font-mono" style="white-space:nowrap;">
              {{ item.datetime ?? '—' }}
            </span>
          </template>

          <!-- Nivel -->
          <template #item.level="{ item }">
            <VChip
              :color="getLevelColor(item.level)"
              size="x-small" variant="tonal"
              :prepend-icon="getLevelIcon(item.level)"
            >
              {{ item.level.toUpperCase() }}
            </VChip>
          </template>

          <!-- Mensaje + chevron -->
          <template #item.header="{ item }">
            <div class="d-flex align-center justify-space-between gap-3">
              <span class="text-body-2 font-mono log-msg-text">{{ item.header }}</span>
              <VIcon
                v-if="item.canExpand"
                size="16"
                class="flex-shrink-0 log-chevron"
                :class="{ 'log-chevron--open': expanded.includes(item.uid) }"
                icon="ri-arrow-down-s-line"
              />
            </div>
          </template>

          <!-- Fila expandida -->
          <template #expanded-row="{ item }">
            <tr v-if="item.context || item.stack">
              <td colspan="3" class="pa-0">
                <div class="expanded-panel">

                  <!-- ── Banda header: fecha + nivel + tipo ── -->
                  <div class="exp-header-band">
                    <VChip :color="getLevelColor(item.level)" size="x-small" variant="tonal" :prepend-icon="getLevelIcon(item.level)" class="font-weight-bold">
                      {{ item.level.toUpperCase() }}
                    </VChip>
                    <span v-if="item.datetime" class="exp-datetime">
                      <VIcon icon="ri-time-line" size="12" class="me-1" />{{ item.datetime }}
                    </span>
                    <VSpacer />
                    <VChip v-if="item.context?.type" size="x-small" color="secondary" variant="tonal">
                      {{ item.context.type }}
                    </VChip>
                  </div>

                  <!-- ── Mensaje ── -->
                  <pre class="exp-message mb-3">{{ item.header }}</pre>

                  <!-- ── Backend ── -->
                  <template v-if="tipoEntorno === 'laravel' && item.context">
                    <!-- Método + ruta -->
                    <div v-if="item.context.metodo || item.context.ruta" class="d-flex flex-wrap gap-2 mb-2">
                      <VChip v-if="item.context.metodo" color="primary" size="x-small" variant="flat" class="font-weight-bold">
                        {{ item.context.metodo }}
                      </VChip>
                      <VChip v-if="item.context.ruta" size="x-small" variant="outlined">{{ item.context.ruta }}</VChip>
                    </div>
                    <!-- URL -->
                    <div v-if="item.context.url" class="exp-meta mb-1">
                      <VIcon icon="ri-global-line" size="13" class="me-1 text-info" />
                      <span class="text-info font-mono">{{ item.context.url }}</span>
                    </div>
                    <!-- Archivo -->
                    <div v-if="item.context.archivo" class="exp-meta mb-3">
                      <VIcon icon="ri-map-pin-2-line" size="13" class="me-1 text-warning" />
                      <span class="text-warning font-mono">{{ item.context.archivo }}</span>
                    </div>

                    <!-- Request / Headers colapsables -->
                    <VExpansionPanels v-if="item.context.request || item.context.headers" flat class="mb-3 exp-accordion">
                      <VExpansionPanel v-if="item.context.request" :elevation="0">
                        <VExpansionPanelTitle class="text-caption py-1 px-3">
                          <VIcon icon="ri-send-plane-line" size="13" class="me-2" />Request
                        </VExpansionPanelTitle>
                        <VExpansionPanelText>
                          <pre class="exp-json">{{ jsonBonito(item.context.request) }}</pre>
                        </VExpansionPanelText>
                      </VExpansionPanel>
                      <VExpansionPanel v-if="item.context.headers" :elevation="0">
                        <VExpansionPanelTitle class="text-caption py-1 px-3">
                          <VIcon icon="ri-list-check-3" size="13" class="me-2" />Headers
                        </VExpansionPanelTitle>
                        <VExpansionPanelText>
                          <pre class="exp-json">{{ jsonBonito(item.context.headers) }}</pre>
                        </VExpansionPanelText>
                      </VExpansionPanel>
                    </VExpansionPanels>

                    <!-- Grid usuario + email -->
                    <div v-if="item.context?.usuario" class="exp-user-grid mb-3">
                      <div class="exp-user-cell">
                        <div class="section-label mb-1">
                          <VIcon icon="ri-user-line" size="12" class="me-1" />Usuario
                        </div>
                        <span class="text-body-2 font-weight-medium">
                          {{ item.context.usuario.name ?? '—' }}
                        </span>
                      </div>
                      <div v-if="item.context.usuario.email" class="exp-user-cell">
                        <div class="section-label mb-1">
                          <VIcon icon="ri-mail-line" size="12" class="me-1" />Email
                        </div>
                        <span class="text-body-2 font-mono">{{ item.context.usuario.email }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- ── Frontend ── -->
                  <template v-else-if="tipoEntorno === 'frontend' && item.context">
                    <div v-if="item.context.url" class="exp-meta mb-1">
                      <VIcon icon="ri-global-line" size="13" class="me-1 text-info" />
                      <span class="text-info font-mono">{{ item.context.url }}</span>
                    </div>
                    <div v-if="item.context.userAgent" class="exp-meta mb-2">
                      <VIcon icon="ri-computer-line" size="13" class="me-1" />
                      <span class="text-disabled">{{ item.context.userAgent }}</span>
                    </div>
                    <div v-if="item.context.info" class="text-caption mb-3">
                      <strong>Contexto Vue:</strong> {{ item.context.info }}
                    </div>
                  </template>

                  <!-- ── Stack trace ── -->
                  <div v-if="item.stack || item.context?.exception || item.context?.trace">
                    <div class="section-label mb-2">
                      <VIcon icon="ri-stack-line" size="12" class="me-1" />Stack Trace
                    </div>
                    <pre class="exp-stack">{{ formatStack(item.stack ?? item.context?.exception ?? item.context?.trace ?? '') }}</pre>
                  </div>

                </div>
              </td>
            </tr>
          </template>

          <!-- Footer con paginación custom -->
          <template #bottom>
            <div class="d-flex align-center justify-space-between flex-wrap pa-3 gap-3">
              <div class="d-flex align-center gap-2">
                <span class="text-caption text-secondary">Filas por página:</span>
                <VSelect
                  v-model="itemsPerPage"
                  :items="opcionesPorPagina"
                  density="compact"
                  hide-details
                  style="width:80px;"
                />
              </div>
              <span class="text-caption text-secondary">
                {{ pag?.from ?? 0 }}–{{ pag?.to ?? 0 }} de {{ pag?.total ?? 0 }}
              </span>
              <VPagination
                v-model="page"
                :length="pag?.last_page ?? 1"
                :total-visible="5"
                density="compact"
                size="small"
              />
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.font-mono { font-family: 'Consolas', 'Courier New', monospace; }

/* ── Fila clickeable ────────────────────────────────────────── */
:deep(.log-row-clickable) { cursor: pointer; }
:deep(.log-row-clickable:hover td) {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

/* Texto del mensaje truncado */
.log-msg-text {
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

/* Chevron animado */
.log-chevron {
  opacity: 0.45;
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.log-chevron--open {
  transform: rotate(180deg);
  opacity: 0.8;
}

/* ── Etiqueta de sección ────────────────────────────────────── */
.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .9px;
  opacity: .45;
  display: flex;
  align-items: center;
}

/* ── Panel expandido ────────────────────────────────────────── */
.expanded-panel {
  padding: 20px 24px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Banda de header del panel */
.exp-header-band {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin-bottom: 12px;
}

.exp-datetime {
  font-size: 12px;
  font-family: 'Consolas', 'Courier New', monospace;
  opacity: 0.7;
  display: inline-flex;
  align-items: center;
}

/* Bloque del mensaje principal */
.exp-message {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 12px 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  line-height: 1.65;
  margin-bottom: 14px;
}

/* Líneas de metadata (URL, archivo) */
.exp-meta {
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  line-height: 1.5;
}

/* JSON en acordeón */
.exp-json {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

/* Acordeón de request/headers */
.exp-accordion {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}

/* Grid de 2 columnas: usuario / email */
.exp-user-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.exp-user-cell {
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Stack trace con borde de color de nivel */
.exp-stack {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.65;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
  color: rgb(var(--v-theme-error));
  max-height: 340px;
  overflow-y: auto;
}
</style>
