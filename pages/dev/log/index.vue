<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'ver logs sistema',
  subject: 'DevHerramienta',
})

const { get, deleted } = useClienteRequest()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()
const router = useRouter()

// ── Referencia al DataTable para refrescar tras borrar ────────────────────────
const dataTable = ref<any>(null)

const columnas = [
  { title: 'Fecha',    key: 'fecha' },
  { title: 'Total',   key: 'all' },
  { title: 'Error',   key: 'error' },
  { title: 'Warning', key: 'warning' },
  { title: 'Notice',  key: 'notice' },
  { title: 'Info',    key: 'info' },
  { title: 'Debug',   key: 'debug' },
  { title: 'Acciones', key: 'Acciones', sortable: false },
]

const nivelConfig: Record<string, { color: string; icon: string }> = {
  all:     { color: 'default',   icon: 'ri-list-check-3' },
  error:   { color: 'error',     icon: 'ri-close-circle-line' },
  warning: { color: 'warning',   icon: 'ri-error-warning-line' },
  notice:  { color: 'info',      icon: 'ri-information-line' },
  info:    { color: 'primary',   icon: 'ri-information-line' },
  debug:   { color: 'secondary', icon: 'ri-bug-2-line' },
}

// ── Navegación ────────────────────────────────────────────────────────────────
const verLog = (item: any) => {
  const canal = item.channels?.includes('laravel') ? 'laravel' : (item.channels?.[0] ?? 'laravel')
  router.push({ path: `/dev/log/show/${item.fecha}`, query: { channel: canal } })
}

// ── Descarga ──────────────────────────────────────────────────────────────────
const descargar = async (fecha: string, channel: string) => {
  try {
    const res = await get(`api/configuracion/log-viewer/logs/${fecha}/download?channel=${channel}`, {
      responseType: 'blob',
    } as any)
    const blob  = new Blob([(res as any).data ?? res], { type: 'text/plain' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href      = url
    a.download  = `${channel}-${fecha}.log`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    showToastError('No se pudo descargar el archivo')
  }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────
const eliminar = async (fecha: string, channel: string) => {
  const ok = await preguntaEliminar(
    `¿Eliminar log ${channel} del ${fecha}?`,
    'Esta acción no se puede deshacer.',
  )
  if (!ok) return
  try {
    await deleted('api/configuracion/log-viewer/logs/delete', { fecha, channel })
    showToastSuccess('Log eliminado')
    dataTable.value?.getItems()
  } catch {
    showToastError('Error al eliminar el log')
  }
}

const eliminarAmbos = async (fecha: string, channels: string[]) => {
  const ok = await preguntaEliminar(
    `¿Eliminar todos los logs del ${fecha}?`,
    'Se eliminarán backend y frontend.',
  )
  if (!ok) return
  try {
    for (const ch of channels) {
      await deleted('api/configuracion/log-viewer/logs/delete', { fecha, channel: ch })
    }
    showToastSuccess('Logs eliminados')
    dataTable.value?.getItems()
  } catch {
    showToastError('Error al eliminar los logs')
  }
}

const nombreCanal = (ch: string) => ch === 'laravel' ? 'Backend' : 'Frontend'
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="py-3">
          <div class="d-flex align-center gap-3">
            <VIcon icon="ri-file-text-line" size="22" color="primary" />
            <span class="text-h6 font-weight-medium">Visor de Logs</span>
            <VChip color="secondary" variant="tonal" size="small">por fecha</VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <DataTableComponent
        ref="dataTable"
        endpoint="api/configuracion/log-viewer/menu"
        :columnas="columnas"
        :botones="[]"
        titulo="Archivos de Log"
        :cantidad-por-pagina="15"
      >
        <!-- Headers personalizados con color por nivel -->
        <template #header.all="{ column }">
          <div class="d-flex align-center gap-1">
            <VIcon :icon="nivelConfig.all.icon" size="14" />
            {{ column.title }}
          </div>
        </template>
        <template v-for="nv in ['error','warning','notice','info','debug']" #[`header.${nv}`]="{ column }" :key="nv">
          <div class="d-flex align-center gap-1" :style="{ color: `rgb(var(--v-theme-${nivelConfig[nv].color}))` }">
            <VIcon :icon="nivelConfig[nv].icon" size="14" />
            {{ column.title }}
          </div>
        </template>

        <!-- Celdas de conteo -->
        <template #item.all="{ item }">
          <VChip size="x-small" variant="tonal">{{ item.all?.count ?? 0 }}</VChip>
        </template>
        <template v-for="nv in ['error','warning','notice','info','debug']" #[`item.${nv}`]="{ item }" :key="nv">
          <VChip
            v-if="(item[nv]?.count ?? 0) > 0"
            :color="nivelConfig[nv].color"
            size="x-small" variant="tonal"
          >{{ item[nv].count }}</VChip>
          <span v-else class="text-disabled text-caption">—</span>
        </template>

        <!-- Canales de la fila -->
        <template #item.fecha="{ item }">
          <div>
            <span class="font-weight-medium">{{ item.fecha }}</span>
            <div class="d-flex gap-1 mt-1">
              <VChip
                v-for="ch in item.channels" :key="ch"
                size="x-small"
                :color="ch === 'laravel' ? 'primary' : 'success'"
                variant="tonal"
              >{{ nombreCanal(ch) }}</VChip>
            </div>
          </div>
        </template>

        <!-- Acciones -->
        <template #item.Acciones="{ item }">
          <div class="d-flex align-center gap-1">
            <!-- Ver -->
            <VBtn
              size="x-small" variant="tonal" color="primary"
              icon="ri-eye-line"
              @click="verLog(item)"
            />

            <!-- Descargar -->
            <VMenu v-if="item.channels?.length > 1">
              <template #activator="{ props: menuProps }">
                <VBtn size="x-small" variant="tonal" color="secondary" icon="ri-download-2-line" v-bind="menuProps" />
              </template>
              <VList density="compact">
                <VListItem
                  v-for="ch in item.channels" :key="ch"
                  :title="nombreCanal(ch)"
                  @click="descargar(item.fecha, ch)"
                />
              </VList>
            </VMenu>
            <VBtn
              v-else
              size="x-small" variant="tonal" color="secondary"
              icon="ri-download-2-line"
              @click="descargar(item.fecha, item.channels?.[0] ?? 'laravel')"
            />

            <!-- Eliminar -->
            <VMenu>
              <template #activator="{ props: menuProps }">
                <VBtn size="x-small" variant="tonal" color="error" icon="ri-delete-bin-line" v-bind="menuProps" />
              </template>
              <VList density="compact">
                <VListItem
                  v-for="ch in item.channels" :key="ch"
                  :title="`Eliminar ${nombreCanal(ch)}`"
                  @click="eliminar(item.fecha, ch)"
                />
                <VDivider v-if="item.channels?.length > 1" />
                <VListItem
                  v-if="item.channels?.length > 1"
                  title="Eliminar Ambos"
                  class="text-error"
                  @click="eliminarAmbos(item.fecha, item.channels)"
                />
              </VList>
            </VMenu>
          </div>
        </template>
      </DataTableComponent>
    </VCol>
  </VRow>
</template>
