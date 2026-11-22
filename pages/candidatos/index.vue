<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver candidatos',
  subject: 'Candidato',
})

const { deleted } = useClienteRequest()

const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const dataTableRef = ref(null)

const headers = [
  { key: 'primer_nombre', title: 'Primer Nombre', value: 'primer_nombre' },
  { key: 'primer_apellido', title: 'Primer Apellido', value: 'primer_apellido' },
  { key: 'email', title: 'Correo', value: 'email' },
  { key: 'telefono', title: 'Teléfono', value: 'telefono' },
  { key: 'fecha_nacimiento', title: 'Fecha de Nacimiento', value: 'fecha_nacimiento', exportValue: (i: any) => formatearFecha(i.fecha_nacimiento) },
  { key: 'expectativa_salarial', title: 'Expectativa Salarial', value: 'expectativa_salarial' },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar Candidato?')

  if (!confirm)
    return

  try {
    const respuesta = await deleted(`api/candidatos/${id}`)

    showToastSuccess(respuesta.message)
    dataTableRef.value?.getItems()
  }
  catch (error: any) {
    showToastError(error.message)
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de candidatos'" />
    <VBtn
      v-if="can('crear candidatos', 'Candidato')"
      class="ms-auto"
      color="success"
      to="/candidatos/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nuevo Candidato
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/candidatos"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.fecha_nacimiento="{ item }">
      <span v-text="formatearFecha(item.fecha_nacimiento)" />
    </template>

    <template #item.expectativa_salarial="{ item }">
      <span v-text="formatearQuetzales(item.expectativa_salarial)" />
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver candidatos', 'Candidato')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/candidatos/show/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('editar candidatos', 'Candidato')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/candidatos/edit/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('eliminar candidatos', 'Candidato')"
        icon="ri-delete-bin-line"
        variant="tonal"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>
</template>
