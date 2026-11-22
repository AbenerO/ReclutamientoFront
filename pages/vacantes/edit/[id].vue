<script setup lang="ts">
import { ref } from 'vue'
import Fields from '@/views/pages/vacantes/fields.vue'

import type { VacanteInterface } from '@/types/vacantes/index'

definePageMeta({
  middleware: 'permissions',
  action: 'editar vacantes',
  subject: 'Vacante',
})

const { put, get } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const route = useRoute()

const id = route.params.id

const { paginaEspera } = useCargandoPagina()

const actualizarVacante = async (Vacante: VacanteInterface): Promise<void> => {
  paginaEspera.value = true

  try {
    const respuesta = await put(`api/vacantes/${id}`, Vacante)

    showToastSuccess(respuesta.message)

    navigateTo('/vacantes')
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
  }
}

const itemVacante = ref<VacanteInterface>({
  unidad_id: null,
  titulo: null,
  descripcion: null,
  modalidad_id: null,
  salario_minimo: null,
  salario_maximo: null,
  ubicacion: null,
  estado_vacante_id: null,
  user_id: null,
})

const getVacante = async () => {
  try {
    paginaEspera.value = true

    const respuesta: { data: VacanteInterface } = await get(`api/vacantes/${id}`)

    itemVacante.value = respuesta.data
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }

  paginaEspera.value = false
}

getVacante()

const puedeMostrarDatos = computed(() => {
  return Object.values(itemVacante.value).some(valor => valor !== null && valor !== undefined)
})
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Editar Vacante'" />
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
        v-if="puedeMostrarDatos"
        :item="itemVacante"
        @emitir-datos="actualizarVacante"
      />
    </VCardText>
  </VCard>
</template>
