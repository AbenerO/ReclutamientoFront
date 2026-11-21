<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import AddEditPermissionDialog from '@/components/dialogs/AddEditPermissionDialog.vue'

definePageMeta({
  middleware: 'permissions',
  action: 'ver permisos',
  subject: 'Permission',
})

const { deleted } = useClienteRequest()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const dataTableRef = ref(null)
const isDialogVisible = ref(false)
const permissionSeleccionado = ref(null)

const headers = [
  { title: 'Nombre', value: 'name', key: 'name' },
  { title: 'Subject', value: 'subject', key: 'subject' },
  { title: 'Guard', value: 'guard_name', key: 'guard_name' },
  { title: 'Acciones', value: 'Acciones', key: 'Acciones', sortable: false },
]

const abrirCrear = () => {
  permissionSeleccionado.value = null
  isDialogVisible.value = true
}

const abrirEditar = (item: any) => {
  permissionSeleccionado.value = item
  isDialogVisible.value = true
}

const onSaved = () => {
  dataTableRef.value?.getItems()
}

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea eliminar este permiso?')
  if (!confirm)
    return

  try {
    const respuesta = await deleted(`api/permissions/${id}`)
    showToastSuccess(respuesta.message)
    dataTableRef.value?.getItems()
  }
  catch (error: any) {
    showToastError(error.message)
  }
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center justify-sm-space-between justify-start gap-4 flex-wrap">
      <h1 class="text-h5">
        Permisos del Sistema
      </h1>
      <VBtn
        v-if="can('crear permisos', 'Permission')"
        prepend-icon="ri-add-line"
        @click="abrirCrear"
      >
        Agregar Permiso
      </VBtn>
    </VCardText>

    <VDivider />

    <DataTableComponent
      ref="dataTableRef"
      :columnas="headers"
      endpoint="api/permissions"
      :cantidad-por-pagina="10"
      :cantidad-por-pagina-opciones="[10, 20, 30]"
      :botones="['xlsx', 'csv', 'reiniciar']"
    >
      <template #item.name="{ item }">
        <span class="font-weight-medium">{{ item.name }}</span>
      </template>

      <template #item.subject="{ item }">
        <VChip size="small" color="primary" variant="tonal">
          {{ item.subject }}
        </VChip>
      </template>

      <template #item.guard_name="{ item }">
        <VChip size="small" color="secondary" variant="tonal">
          {{ item.guard_name }}
        </VChip>
      </template>

      <template #item.Acciones="{ item }">
        <VBtn
          v-if="can('editar permisos', 'Permission')"
          icon="ri-edit-box-line"
          variant="tonal"
          color="warning"
          class="me-2"
          @click="abrirEditar(item)"
        />
        <VBtn
          v-if="can('eliminar permisos', 'Permission')"
          icon="ri-delete-bin-line"
          variant="tonal"
          color="error"
          size="small"
          @click="deleteItem(item.id)"
        />
      </template>
    </DataTableComponent>
  </VCard>

  <AddEditPermissionDialog
    v-model:is-dialog-visible="isDialogVisible"
    :permission="permissionSeleccionado"
    @saved="onSaved"
  />
</template>