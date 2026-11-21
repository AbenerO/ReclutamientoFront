<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'crear permisos',
  subject: 'permisos',
});

import { ref } from 'vue'
import Fields from '@/views/pages/permissiones/fields.vue'

import type { PermissionInterface } from '@/types/admin/PermisoInterface.ts'

const { post } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const requestInProgress = ref(false) // Evitar solicitudes concurrentes
const { paginaEspera } = useCargandoPagina()

const guardarPermission = async (Permission: PermissionInterface): Promise<void> => {
  if (!requestInProgress.value) {
    requestInProgress.value = true // Establecer bandera de solicitud en progreso
    paginaEspera.value = true // Activar indicador de carga

    try {
      const respuesta = {
        data: Permission,
      }

      const res = await post('/api/permissions', respuesta)

      showToastSuccess(res.message)

      navigateTo('/permisos')
    }
    catch (error: any) {
      showToastError(error.message)
    }
    finally {
      paginaEspera.value = false // Desactivar indicador de carga
      requestInProgress.value = false // Liberar la bandera
    }
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Crear Permission'" />
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/permisos/"
    >
      <VIcon class="mr-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        @emitir-datos="guardarPermission"
      />
    </VCardText>
  </VCard>
</template>
