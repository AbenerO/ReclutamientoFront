<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

const { deleted } = useClienteRequest()

const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const headers: any[] = []

// Placeholders que serán reemplazados por el generador de código
const model = '{{ model }}'

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar {{ model }}?')

  if (!confirm)
    return

  try {
    const respuesta = await deleted(`{{ url }}/${id}`)

    showToastSuccess(respuesta.message)
  }
  catch (error: any) {
    showToastError(error.message)
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de {{ modelPlural }}'" />
    <VBtn
      v-if="can('crear {{ modelPlural }}', '{{ model }}')"
      class="ms-auto"
      color="success"
      to="/{{ directory }}/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nuev@ {{ model }}
    </VBtn>
  </div>

  <DataTableComponent
    :columnas="headers"
    endpoint="{{ url }}"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver {{ modelPlural }}', '{{ model }}')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/{{ directory }}/show/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('editar {{ modelPlural }}', '{{ model }}')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/{{ directory }}/edit/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('eliminar {{ modelPlural }}', '{{ model }}')"
        icon="ri-delete-bin-line"
        variant="tonal"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>
</template>
