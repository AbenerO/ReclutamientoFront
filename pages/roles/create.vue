<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'crear roles',
  subject: 'Role',
});

import { ref } from 'vue'
import Fields from '@/views/pages/roles/fields.vue'

import type { RoleInterface } from '@/types/roles'

const { post } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const requestInProgress = ref(false) // Evitar solicitudes concurrentes
const { paginaEspera } = useCargandoPagina()

const guardarRole = async (Role: RoleInterface): Promise<void> => {
  if (!requestInProgress.value) {
    requestInProgress.value = true // Establecer bandera de solicitud en progreso
    paginaEspera.value = true // Activar indicador de carga

    try {
      const respuesta: { message: string } = await post('api/roles', Role)

      showToastSuccess(respuesta.message)

      navigateTo('/roles')
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
    <h1 v-text="'Crear Role'" />
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/roles/"
    >
      <VIcon class="mr-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        @emitir-datos="guardarRole"
      />
    </VCardText>
  </VCard>
</template>
