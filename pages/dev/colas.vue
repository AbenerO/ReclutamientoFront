<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'ver colas sistema',
  subject: 'DevHerramienta',
})

const { get, deleted } = useClienteRequest()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

interface JobFallido {
  id: number
  uuid: string
  connection: string
  queue: string
  nombre: string
  fallido_en: string
  excepcion: string
}

const pendientes = ref(0)
const totalFallidos = ref(0)
const fallidos = ref<JobFallido[]>([])
const cargando = ref(false)
const excepcionAbierta = ref<string | null>(null)

const cargar = async () => {
  cargando.value = true
  try {
    const resp = await get('api/dev/colas')
    pendientes.value = resp.data.pendientes
    totalFallidos.value = resp.data.total_fallidos
    fallidos.value = resp.data.fallidos
  } finally {
    cargando.value = false
  }
}

const limpiarFallidos = async () => {
  const ok = await preguntaEliminar('¿Limpiar todos los jobs fallidos?', 'Esta acción no se puede deshacer.')
  if (!ok) return
  try {
    await deleted('api/dev/colas/fallidos')
    showToastSuccess('Cola de fallidos limpiada')
    fallidos.value = []
    totalFallidos.value = 0
  } catch {
    showToastError('Error al limpiar la cola')
  }
}

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Cola', key: 'queue' },
  { title: 'Fallido en', key: 'fallido_en' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

cargar()
</script>

<template>
  <VRow>
    <!-- Stats -->
    <VCol cols="12" md="4">
      <VCard>
        <VCardText class="text-center pa-6">
          <VIcon size="40" color="warning" class="mb-2">ri-time-line</VIcon>
          <div class="text-h4 font-weight-bold">{{ pendientes }}</div>
          <div class="text-secondary">Jobs pendientes</div>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText class="text-center pa-6">
          <VIcon size="40" color="error" class="mb-2">ri-alarm-warning-line</VIcon>
          <div class="text-h4 font-weight-bold">{{ totalFallidos }}</div>
          <div class="text-secondary">Jobs fallidos (total)</div>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard>
        <VCardText class="text-center pa-6">
          <VIcon size="40" color="success" class="mb-2">ri-database-2-line</VIcon>
          <div class="text-h6 font-weight-bold">{{ pendientes === 0 && totalFallidos === 0 ? 'OK' : 'Revisar' }}</div>
          <div class="text-secondary">Estado de la cola</div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Tabla de fallidos -->
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-4">
          <span>
            <VIcon class="me-2 ri-stack-line" />
            Jobs Fallidos
          </span>
          <div class="d-flex gap-2">
            <VBtn size="small" variant="tonal" prepend-icon="ri-refresh-line" @click="cargar" :loading="cargando">
              Actualizar
            </VBtn>
            <VBtn
              v-if="totalFallidos > 0"
              size="small"
              variant="tonal"
              color="error"
              prepend-icon="ri-delete-bin-line"
              @click="limpiarFallidos"
            >
              Limpiar todos
            </VBtn>
          </div>
        </VCardTitle>

        <VDataTable
          :headers="headers"
          :items="fallidos"
          :loading="cargando"
          no-data-text="No hay jobs fallidos"
          items-per-page="10"
        >
          <template #item.nombre="{ item }">
            <span class="font-weight-medium">{{ item.nombre }}</span>
          </template>

          <template #item.queue="{ item }">
            <VChip size="small" variant="tonal" color="secondary">
              {{ item.queue }}
            </VChip>
          </template>

          <template #item.fallido_en="{ item }">
            {{ item.fallido_en }}
          </template>

          <template #item.acciones="{ item }">
            <VBtn
              size="small"
              variant="text"
              color="primary"
              icon="ri-eye-line"
              @click="excepcionAbierta = item.excepcion"
            />
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <!-- Dialog excepción -->
  <VDialog v-model="excepcionAbierta" max-width="800">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span>Excepción</span>
        <VBtn icon="ri-close-line" size="small" variant="text" @click="excepcionAbierta = null" />
      </VCardTitle>
      <VCardText>
        <pre class="excepcion-pre">{{ excepcionAbierta }}</pre>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.excepcion-pre {
  background: #0d1117;
  color: #ff6b6b;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>