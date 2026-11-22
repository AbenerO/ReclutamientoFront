<script setup lang="ts">
import { ref } from 'vue'
import Fields from '@/views/pages/unidades/fields.vue'

import type { UnidadInterface } from '@/types/unidades/index'

definePageMeta({
  middleware: 'permissions',
  action: 'editar unidades',
  subject: 'Unidad',
})

const { put, get } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const route = useRoute()

const id = route.params.id

const { paginaEspera } = useCargandoPagina()

const actualizarUnidad = async (Unidad: UnidadInterface): Promise<void> => {
  paginaEspera.value = true

  try {
    const respuesta = await put(`api/unidades/${id}`, Unidad)

    showToastSuccess(respuesta.message)

    navigateTo('/unidades')
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
  }
}

const itemUnidad = ref<UnidadInterface>({
  nombre: null,
  descripcion: null,
  activo: true,
})

const getUnidad = async () => {
  try {
    paginaEspera.value = true

    const respuesta: { data: UnidadInterface } = await get(`api/unidades/${id}`)

    itemUnidad.value = respuesta.data
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }

  paginaEspera.value = false
}

getUnidad()

// El formulario se muestra hasta que lleguen los datos (el nombre nunca es null en una unidad guardada)
const puedeMostrarDatos = computed(() => itemUnidad.value.nombre !== null)
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Editar Unidad'" />
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
      <Fields
        v-if="puedeMostrarDatos"
        :item="itemUnidad"
        @emitir-datos="actualizarUnidad"
      />
    </VCardText>
  </VCard>
</template>
