<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClienteRequest } from '@/composables/useClienteRequest'
import { useToast } from '@/composables/useToast'

definePageMeta({
  middleware: 'permissions',
  action: 'ver roles',
  subject: 'Role',
});

import { can } from '@layouts/plugins/casl'

const { get, deleted } = useClienteRequest()

const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const dataTableRef = ref(null)
const roles = ref([])

// Variables para el modal
const seleccionarRol = ref()
const verModalDeRol = ref(false)
const formMode = ref('create')

const headers = [
  { key: 'name', title: 'Name', value: 'name' },
  { key: 'guard_name', title: 'Guard Name', value: 'guard_name' },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

const fetchRoles = async () => {
  try {
    const { data } = await get('api/roles')

    roles.value = data.data
  }
  catch (error) {
    showToastError(error.response?.data.message?.toString() || error.message)
  }
}

// Crear un nuevo rol
const crearNuevoRol = () => {
  seleccionarRol.value = null
  formMode.value = 'create'
  verModalDeRol.value = true
}

// Editar un rol
const editarRol = (rol: any) => {
  seleccionarRol.value = rol
  formMode.value = 'edit'
  verModalDeRol.value = true
}

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar Role?')

  if (!confirm)
    return

  try {
    const respuesta = await deleted(`api/roles/${id}`)

    showToastSuccess(respuesta.message)

    if (dataTableRef.value)
      await dataTableRef.value.getItems()

    await fetchRoles()
  }
  catch (error) {
    showToastError(error.message)
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <VRow
    v-if="roles.length"
    class="mb-4"
  >
    <VCol
      v-for="role in roles"
      :key="role.id"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardText>
          <h5 class="text-h5 mb-1">
            {{ role.name }}
          </h5>
        </VCardText>
        <VCardActions>
          <VBtn
            v-if="can('editar roles', 'Role')"
            icon="ri-edit-box-line"
            color="warning"
            :to="`/roles/edit/${role.id}`"
          />
          <VBtn
            v-if="can('eliminar roles', 'Role')"
            icon="ri-delete-bin-line"
            color="error"
            @click="deleteItem(role.id)"
          />
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>

  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de roles'" />
    <VBtn
      v-if="can('crear roles', 'Role')"
      class="ml-auto"
      color="success"
      @click="crearNuevoRol"
    >
      <VIcon class="mr-2 ri-add-large-fill" />
      Nuevo Rol
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/roles"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
    :relaciones="['permissions']"
  >
    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver roles', 'Role')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/roles/show/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('editar roles', 'Role')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        class="mr-1"
        @click="editarRol(item)"
      />
      <VBtn
        v-if="can('eliminar roles', 'Role')"
        icon="ri-delete-bin-line"
        variant="tonal"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>
  <RoleForm
    :visible="verModalDeRol"
    :mode="formMode"
    :rol="seleccionarRol"
    @cerrar="verModalDeRol = false"
    @guardar="dataTableRef.getItems()"
  />
</template>
