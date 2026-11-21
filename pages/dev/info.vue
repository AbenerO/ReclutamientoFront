<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'ver info sistema',
  subject: 'DevHerramienta',
})

const { get } = useClienteRequest()

interface InfoSistema {
  app: Record<string, string>
  sistema: Record<string, string>
  base_datos: Record<string, string>
  servicios: Record<string, string>
}

const info = ref<InfoSistema | null>(null)
const cargando = ref(false)

const secciones = computed(() => {
  if (!info.value) return []
  return [
    { titulo: 'Aplicación', icono: 'ri-layout-grid-line', color: 'primary', datos: info.value.app },
    { titulo: 'Sistema', icono: 'ri-server-line', color: 'success', datos: info.value.sistema },
    { titulo: 'Base de Datos', icono: 'ri-database-2-line', color: 'warning', datos: info.value.base_datos },
    { titulo: 'Servicios', icono: 'ri-settings-4-line', color: 'secondary', datos: info.value.servicios },
  ]
})

const cargar = async () => {
  cargando.value = true
  try {
    const resp = await get('api/dev/info')
    info.value = resp.data
  } finally {
    cargando.value = false
  }
}

cargar()
</script>

<template>
  <VRow>
    <VCol cols="12" class="d-flex align-center justify-space-between">
      <h2 class="text-h5">
        <VIcon class="me-2 ri-information-line" />
        Información del Sistema
      </h2>
      <VBtn size="small" variant="tonal" prepend-icon="ri-refresh-line" @click="cargar" :loading="cargando">
        Actualizar
      </VBtn>
    </VCol>

    <VCol v-if="cargando" cols="12" class="d-flex justify-center py-10">
      <VProgressCircular indeterminate />
    </VCol>

    <template v-else-if="info">
      <VCol v-for="seccion in secciones" :key="seccion.titulo" cols="12" md="6">
        <VCard>
          <VCardTitle class="d-flex align-center pa-4 pb-2">
            <VIcon :class="`me-2 ${seccion.icono}`" :color="seccion.color" />
            {{ seccion.titulo }}
          </VCardTitle>
          <VDivider />
          <VList density="compact">
            <VListItem
              v-for="(valor, clave) in seccion.datos"
              :key="clave"
              class="px-4"
            >
              <template #prepend>
                <span class="text-secondary text-caption text-uppercase" style="min-width: 120px; display: inline-block;">
                  {{ clave.replace(/_/g, ' ') }}
                </span>
              </template>
              <VListItemTitle>
                <VChip
                  :color="clave === 'debug' && valor === 'Habilitado' ? 'warning' : 'default'"
                  :variant="clave === 'debug' && valor === 'Habilitado' ? 'tonal' : 'text'"
                  size="small"
                  class="font-weight-medium"
                >
                  {{ valor }}
                </VChip>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>
    </template>
  </VRow>
</template>