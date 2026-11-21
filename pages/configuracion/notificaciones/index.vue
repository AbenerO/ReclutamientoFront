<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { NotificacionInterface } from '@/types/notificaciones'

definePageMeta({
  middleware: 'permissions',
  action: 'ver notificaciones',
  subject: 'Notificacion',
})

const headers: any[] = [
  { key: 'canal', title: 'Canal', value: 'canal', sortable: false },
  { key: 'destinatario', title: 'Destinatario', value: 'destinatario' },
  { key: 'asunto', title: 'Asunto / Mensaje', value: 'asunto', sortable: false },
  { key: 'origen', title: 'Origen', value: 'origen' },
  { key: 'estado', title: 'Estado', value: 'estado' },
  { key: 'enviado_en', title: 'Enviado', value: 'enviado_en' },
  { key: 'acciones', title: '', value: 'acciones', sortable: false },
]

const filtrosUi = reactive({
  canal: null as string | null,
  estado: null as string | null,
  origen: null as string | null,
})

const filtros = computed(() => {
  const f: Record<string, any> = {}
  if (filtrosUi.canal)
    f.canal = filtrosUi.canal
  if (filtrosUi.estado)
    f.estado = filtrosUi.estado
  if (filtrosUi.origen)
    f.origen = filtrosUi.origen
  return f
})

const canalMeta: Record<string, { label: string; icon: string; color: string }> = {
  email: { label: 'Correo', icon: 'ri-mail-line', color: 'primary' },
  whatsapp: { label: 'WhatsApp', icon: 'ri-whatsapp-line', color: 'success' },
}

const estadoMeta: Record<string, { label: string; color: string; icon: string }> = {
  pendiente: { label: 'Pendiente', color: 'warning', icon: 'ri-time-line' },
  enviado: { label: 'Enviado', color: 'info', icon: 'ri-check-line' },
  entregado: { label: 'Entregado', color: 'success', icon: 'ri-check-double-line' },
  leido: { label: 'Leído', color: 'success', icon: 'ri-check-double-line' },
  fallido: { label: 'Fallido', color: 'error', icon: 'ri-close-line' },
}

const origenMeta: Record<string, string> = {
  prueba: 'Prueba',
  manual: 'Manual',
}

const formatFecha = (v: string | null) =>
  v ? new Date(v).toLocaleString('es-GT') : '—'

const detalle = ref<NotificacionInterface | null>(null)
const dialog = ref(false)

const verDetalle = (item: NotificacionInterface) => {
  detalle.value = item
  dialog.value = true
}
</script>

<template>
  <div class="d-flex flex-wrap justify-space-between align-center gap-3 mb-4">
    <div>
      <h1 class="text-h5 font-weight-bold">
        Bitácora de Mensajes
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Historial de notificaciones enviadas por correo y WhatsApp (pruebas y envíos del sistema).
      </p>
    </div>
    <VBtn
      color="primary"
      to="/configuracion/notificaciones/prueba"
      prepend-icon="ri-send-plane-line"
    >
      Enviar Prueba
    </VBtn>
  </div>

  <VCard class="mb-4" variant="flat" border>
    <VCardText>
      <VRow dense>
        <VCol cols="12" sm="4">
          <VSelect
            v-model="filtrosUi.canal"
            label="Canal"
            :items="[
              { title: 'Correo', value: 'email' },
              { title: 'WhatsApp', value: 'whatsapp' },
            ]"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </VCol>
        <VCol cols="12" sm="4">
          <VSelect
            v-model="filtrosUi.estado"
            label="Estado"
            :items="[
              { title: 'Pendiente', value: 'pendiente' },
              { title: 'Enviado', value: 'enviado' },
              { title: 'Entregado', value: 'entregado' },
              { title: 'Leído', value: 'leido' },
              { title: 'Fallido', value: 'fallido' },
            ]"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </VCol>
        <VCol cols="12" sm="4">
          <VSelect
            v-model="filtrosUi.origen"
            label="Origen"
            :items="[
              { title: 'Prueba', value: 'prueba' },
              { title: 'Manual', value: 'manual' },
            ]"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <DataTableComponent
    :columnas="headers"
    endpoint="api/configuracion/notificacion"
    :filtros="filtros"
    :cantidad-por-pagina="15"
    :cantidad-por-pagina-opciones="[15, 30, 50]"
    :botones="['xlsx', 'csv', 'reiniciar']"
  >
    <template #item.canal="{ item }">
      <VChip
        :color="canalMeta[item.canal]?.color ?? 'default'"
        variant="tonal"
        label
        size="small"
      >
        <VIcon :icon="canalMeta[item.canal]?.icon ?? 'ri-question-line'" size="14" class="me-1" />
        {{ canalMeta[item.canal]?.label ?? item.canal }}
      </VChip>
    </template>

    <template #item.asunto="{ item }">
      <div class="text-truncate" style="max-inline-size: 320px;">
        <span v-if="item.asunto" class="font-weight-medium">{{ item.asunto }}</span>
        <div class="text-caption text-medium-emphasis text-truncate">
          {{ item.cuerpo }}
        </div>
      </div>
    </template>

    <template #item.origen="{ item }">
      {{ origenMeta[item.origen] ?? item.origen }}
    </template>

    <template #item.estado="{ item }">
      <VChip
        :color="estadoMeta[item.estado]?.color ?? 'default'"
        variant="tonal"
        label
        size="small"
      >
        <VIcon :icon="estadoMeta[item.estado]?.icon ?? 'ri-information-line'" size="14" class="me-1" />
        {{ estadoMeta[item.estado]?.label ?? item.estado }}
      </VChip>
    </template>

    <template #item.enviado_en="{ item }">
      {{ formatFecha(item.enviado_en ?? item.created_at) }}
    </template>

    <template #item.acciones="{ item }">
      <VBtn
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        size="small"
        @click="verDetalle(item)"
      />
    </template>
  </DataTableComponent>

  <VDialog v-model="dialog" max-width="560">
    <VCard v-if="detalle">
      <VCardTitle class="d-flex align-center gap-2 pa-4">
        <VIcon :icon="canalMeta[detalle.canal]?.icon ?? 'ri-mail-line'" />
        Detalle del mensaje
      </VCardTitle>
      <VCardText>
        <div class="mb-2">
          <strong>Destinatario:</strong> {{ detalle.destinatario }}
        </div>
        <div v-if="detalle.asunto" class="mb-2">
          <strong>Asunto:</strong> {{ detalle.asunto }}
        </div>
        <div class="mb-2">
          <strong>Estado:</strong> {{ estadoMeta[detalle.estado]?.label ?? detalle.estado }}
        </div>
        <div class="mb-2">
          <strong>Origen:</strong> {{ origenMeta[detalle.origen] ?? detalle.origen }}
        </div>
        <div v-if="detalle.error" class="mb-2 text-error">
          <strong>Error:</strong> {{ detalle.error }}
        </div>
        <VDivider class="my-3" />
        <div class="text-body-2" style="white-space: pre-wrap;">
          {{ detalle.cuerpo }}
        </div>
      </VCardText>
      <VCardActions class="pa-4 pt-0">
        <VSpacer />
        <VBtn variant="tonal" @click="dialog = false">
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
