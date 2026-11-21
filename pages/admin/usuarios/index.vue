<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver usuarios',
  subject: 'User',
})

const { deleted, post } = useClienteRequest()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const dataTableRef = ref(null)

// Dialog de contraseña reseteada
const dialogReset   = ref(false)
const passwordNueva = ref('')
const usuarioReset  = ref('')

const headers = [
  { key: 'nombre_completo', title: 'Nombre', value: 'nombre_completo' },
  { key: 'username', title: 'Username', value: 'username' },
  { key: 'email', title: 'Correo', value: 'email' },
  { key: 'roles', title: 'Rol', value: 'roles' },
  { key: 'estado', title: 'Estado', value: 'estado' },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea desactivar este usuario?')
  if (!confirm)
    return

  try {
    const respuesta = await deleted(`api/usuarios/${id}`)
    showToastSuccess(respuesta.message)
    dataTableRef.value?.getItems()
  }
  catch (error: any) {
    showToastError(error.message)
  }
}

const resetPassword = async (item: any) => {
  const confirm = await preguntaEliminar(
    `¿Resetear la contraseña de "${item.name ?? item.nombre_completo}"?\nSe asignará la contraseña por defecto del año actual.`
  )
  if (!confirm) return

  try {
    const respuesta = await post(`api/usuarios/${item.id}/reset-password`, {})
    usuarioReset.value  = item.name ?? item.nombre_completo
    passwordNueva.value = respuesta.data?.password_generada ?? ''
    dialogReset.value   = true
  }
  catch (error: any) {
    showToastError(error.message)
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de Usuarios'" />
    <VBtn
      v-if="can('crear usuarios', 'User')"
      class="ms-auto"
      color="success"
      to="/admin/usuarios/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nuevo Usuario
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/usuarios"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
    :relaciones="['roles']"
  >
    <template #item.roles="{ item }">
      <VChip
        v-for="rol in item.roles"
        :key="rol.id"
        color="primary"
        size="small"
        class="me-1"
      >
        {{ rol.name }}
      </VChip>
    </template>

    <template #item.estado="{ item }">
      <VChip :color="item.estado ? 'success' : 'error'" size="small">
        {{ item.estado ? 'Activo' : 'Inactivo' }}
      </VChip>
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver usuarios', 'User')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/admin/usuarios/show/${item.id}`"
        class="me-2"
      />
      <VBtn
        v-if="can('editar usuarios', 'User')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/admin/usuarios/edit/${item.id}`"
        class="me-2"
      />
      <VBtn
        v-if="can('editar usuarios', 'User')"
        icon="ri-lock-password-line"
        variant="tonal"
        color="secondary"
        class="me-2"
        title="Resetear contraseña"
        @click="resetPassword(item)"
      />
      <VBtn
        v-if="can('eliminar usuarios', 'User')"
        icon="ri-user-forbid-line"
        variant="tonal"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>

  <!-- Dialog: contraseña reseteada -->
  <VDialog v-model="dialogReset" max-width="400">
    <VCard>
      <VCardText class="pa-6">
        <div class="d-flex align-center gap-3 mb-4">
          <VIcon icon="ri-lock-unlock-line" color="success" size="32" />
          <div>
            <div class="text-h6 font-weight-bold">Contraseña reseteada</div>
            <div class="text-caption text-disabled">{{ usuarioReset }}</div>
          </div>
        </div>

        <VAlert type="info" variant="tonal" class="mb-4">
          Comparte esta contraseña con el usuario. Deberá cambiarla en su próximo inicio de sesión.
        </VAlert>

        <div class="text-caption text-disabled mb-1">Nueva contraseña</div>
        <div
          class="pa-3 rounded font-mono text-h6 font-weight-bold text-center"
          style="background:rgba(var(--v-theme-success),0.08);border:1px solid rgba(var(--v-theme-success),0.3);letter-spacing:3px;"
        >
          {{ passwordNueva }}
        </div>
      </VCardText>

      <VCardActions class="justify-end pa-4 pt-0">
        <VBtn color="primary" @click="dialogReset = false">Entendido</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
