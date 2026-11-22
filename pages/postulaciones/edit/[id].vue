<script setup lang="ts">
import { ref } from 'vue'
import Fields from '@/views/pages/postulaciones/fields.vue'
import type { PostulacionInterface } from '@/types/postulaciones/index'

definePageMeta({
  middleware: 'permissions',
  action: 'editar postulaciones',
  subject: 'Postulacion',
})

const { put, get } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const route = useRoute()
const id = route.params.id
const { paginaEspera } = useCargandoPagina()

const actualizarPostulacion = async (Postulacion: PostulacionInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put(`api/postulaciones/${id}`, Postulacion)

    showToastSuccess(respuesta.message)
    navigateTo('/postulaciones')
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
  }
}

const itemPostulacion = ref<PostulacionInterface>({
  candidato_id: null,
  vacante_id: null,
  fecha_postulacion: null,
  estado_postulacion_id: null,
  fuente_reclutamiento_id: null,
  user_id: null,
})

const getPostulacion = async () => {
  try {
    paginaEspera.value = true

    const respuesta: { data: PostulacionInterface } = await get(`api/postulaciones/${id}`)

    itemPostulacion.value = respuesta.data
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }
  paginaEspera.value = false
}

getPostulacion()

const puedeMostrarDatos = computed(() => {
  return Object.values(itemPostulacion.value).some(valor => valor !== null && valor !== undefined)
})
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Editar Postulacion'" />
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
        v-if="puedeMostrarDatos"
        :item="itemPostulacion"
        @emitir-datos="actualizarPostulacion"
      />
    </VCardText>
  </VCard>
</template>
