<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver unidades',
  subject: 'Unidad',
})

const headers = [
  { key: 'nombre', title: 'Nombre', value: 'nombre' },
  { key: 'descripcion', title: 'Descripción', value: 'descripcion' },
  { key: 'activo', title: 'Estado', value: 'activo', exportValue: (i: any) => i.activo ? 'Activa' : 'Inactiva' },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de unidades'" />
    <VBtn
      v-if="can('crear unidades', 'Unidad')"
      class="ms-auto"
      color="success"
      to="/unidades/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nueva Unidad
    </VBtn>
  </div>

  <DataTableComponent
    :columnas="headers"
    endpoint="api/unidades"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'csv', 'reiniciar']"
  >
    <template #item.activo="{ item }">
      <VChip
        :color="item.activo ? 'success' : 'secondary'"
        v-text="item.activo ? 'Activa' : 'Inactiva'"
      />
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('editar unidades', 'Unidad')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/unidades/edit/${item.id}`"
      />
    </template>
  </DataTableComponent>
</template>
