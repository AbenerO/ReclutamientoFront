<script setup lang="ts">
import Fields from '@/views/pages/unidades/fields.vue'

import type { UnidadInterface } from '@/types/unidades/index'

definePageMeta({
  middleware: 'permissions',
  action: 'crear unidades',
  subject: 'Unidad',
})

const { post } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarUnidad = async (Unidad: UnidadInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta: { message: string } = await post('api/unidades', Unidad)

    showToastSuccess(respuesta.message)
    navigateTo('/unidades')
  }
  catch (error: any) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Crear Unidad'" />
    <VBtn
      class="ms-auto"
      color="secondary"
      to="/unidades/"
    >
      <VIcon class="me-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarUnidad" />
    </VCardText>
  </VCard>
</template>
