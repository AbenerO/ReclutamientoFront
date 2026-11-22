<script setup lang="ts">
import Fields from '@/views/pages/vacantes/fields.vue'

import type { VacanteInterface } from '@/types/vacantes/index'

definePageMeta({
  middleware: 'permissions',
  action: 'crear vacantes',
  subject: 'Vacante',
})

const { post } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const { paginaEspera } = useCargandoPagina()

const guardarVacante = async (Vacante: VacanteInterface): Promise<void> => {
    paginaEspera.value = true

    try {
      const respuesta: { message: string } = await post('api/vacantes', Vacante)

      showToastSuccess(respuesta.message)

      navigateTo('/vacantes')
    }
    catch (error: any) {
      showToastError(error.message)
    }
    finally {
      paginaEspera.value = false // Desactivar indicador de carga
    }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Crear Vacante'" />
    <VBtn
      class="ms-auto"
      color="secondary"
      to="/vacantes/"
    >
      <VIcon class="me-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        @emitir-datos="guardarVacante"
      />
    </VCardText>
  </VCard>
</template>
