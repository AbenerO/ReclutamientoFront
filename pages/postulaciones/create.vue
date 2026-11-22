<script setup lang="ts">
import { ref } from 'vue'
import Fields from '@/views/pages/postulaciones/fields.vue'

import type { PostulacionInterface } from '@/types/postulaciones/index'

definePageMeta({
  middleware: 'permissions',
  action: 'crear postulaciones',
  subject: 'Postulacion',
})

const { post } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const requestInProgress = ref(false) // Evitar solicitudes concurrentes
const { paginaEspera } = useCargandoPagina()

const guardarPostulacion = async (Postulacion: PostulacionInterface): Promise<void> => {
  if (!requestInProgress.value) {
    requestInProgress.value = true // Establecer bandera de solicitud en progreso
    paginaEspera.value = true // Activar indicador de carga

    try {
      const respuesta: { message: string } = await post('api/postulaciones', Postulacion)

      showToastSuccess(respuesta.message)

      navigateTo('/postulaciones')
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
    <h1 v-text="'Crear Postulacion'" />
    <VBtn
      class="ms-auto"
      color="secondary"
      to="/postulaciones/"
    >
      <VIcon class="me-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        @emitir-datos="guardarPostulacion"
      />
    </VCardText>
  </VCard>
</template>
