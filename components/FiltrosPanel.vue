<script setup lang="ts">
/**
 * FiltrosPanel — contenedor reutilizable para paneles de filtros.
 *
 * Uso:
 *   <FiltrosPanel @limpiar="limpiarFiltros">
 *     <VCol cols="12" sm="6" md="4">
 *       <VTextField v-model="form.nombre" label="Nombre" ... />
 *     </VCol>
 *   </FiltrosPanel>
 */
defineProps<{
  titulo?: string
}>()

const emit = defineEmits<{
  (e: 'limpiar'): void
}>()
</script>

<template>
  <VCard class="mb-4" variant="elevated">
    <VCardTitle class="text-body-1 font-weight-medium pa-4 pb-2">
      <VIcon icon="ri-filter-3-line" class="me-2" size="18" />
      {{ titulo ?? 'Buscar / Filtrar' }}
    </VCardTitle>
    <VCardText class="pt-0">
      <VRow dense>
        <slot />
      </VRow>
      <div class="d-flex justify-end mt-3">
        <VBtn
          variant="tonal"
          color="secondary"
          size="small"
          prepend-icon="ri-filter-off-line"
          @click="emit('limpiar')"
        >
          Limpiar filtros
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
