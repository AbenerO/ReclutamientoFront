<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver vacantes',
  subject: 'Vacante',
})

const { deleted } = useClienteRequest()

const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const dataTableRef = ref(null)

const headers = [
  { key: 'titulo', title: 'Título', value: 'titulo' },
  { key: 'unidad', title: 'Unidad', value: 'unidad', exportValue: (i: any) => i.unidad?.nombre },
  { key: 'modalidad', title: 'Modalidad', value: 'modalidad', exportValue: (i: any) => i.modalidad?.nombre },
  { key: 'salario', title: 'Rango Salarial', value: 'salario', exportValue: (i: any) => `${formatearQuetzales(i.salario_minimo)} - ${formatearQuetzales(i.salario_maximo)}` },
  { key: 'ubicacion', title: 'Ubicación', value: 'ubicacion' },
  { key: 'estado_vacante', title: 'Estado', value: 'estado_vacante', exportValue: (i: any) => i.estado_vacante?.nombre },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar Vacante?')

  if (!confirm)
    return

  try {
    const respuesta = await deleted(`api/vacantes/${id}`)

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
    <h1 v-text="'Listado de vacantes'" />
    <VBtn
      v-if="can('crear vacantes', 'Vacante')"
      class="ms-auto"
      color="success"
      to="/vacantes/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nueva Vacante
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/vacantes"
    :relaciones="['unidad', 'modalidad', 'estadoVacante']"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.unidad="{ item }">
      <span v-text="item.unidad?.nombre" />
    </template>

    <template #item.modalidad="{ item }">
      <span v-text="item.modalidad?.nombre" />
    </template>

    <template #item.salario="{ item }">
      <span v-text="`${formatearQuetzales(item.salario_minimo)} - ${formatearQuetzales(item.salario_maximo)}`" />
    </template>

    <template #item.estado_vacante="{ item }">
      <span v-text="item.estado_vacante?.nombre" />
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver vacantes', 'Vacante')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/vacantes/show/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('editar vacantes', 'Vacante')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/vacantes/edit/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('eliminar vacantes', 'Vacante')"
        icon="ri-delete-bin-line"
        variant="tonal"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>
</template>
