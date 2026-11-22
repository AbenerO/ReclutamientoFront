<script setup lang="ts">
import { ref } from 'vue'
import type { PostulacionInterface } from '@/types/postulaciones/index'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

const { get } = useClienteRequest()

const { showToastError } = useToast()

const route = useRoute()

const id = route.params.id

const { paginaEspera } = useCargandoPagina()

const item = ref<PostulacionInterface>({
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

    const respuesta: { data: PostulacionInterface } = await get(`api/postulaciones/${id}?include=candidato,vacante,estadoPostulacion,fuenteReclutamiento`)

    item.value = respuesta.data
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }

  paginaEspera.value = false
}

const puedeMostrarDatos = computed(() => {
  return Object.values(item.value).some(valor => valor !== null && valor !== undefined)
})

getPostulacion()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Visualizar Postulacion'" />
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
      <VList
        v-if="puedeMostrarDatos"
        class="card-list mt-2"
      >
        <VListItemTitle>
          <h6 class="text-h6">
            Candidato:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.candidato?.primer_nombre }} {{ item.candidato?.primer_apellido }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Vacante:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.vacante?.titulo }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Fecha de Postulación:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ formatearFecha(item.fecha_postulacion) }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Estado:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.estado_postulacion?.nombre }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Fuente de Reclutamiento:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.fuente_reclutamiento?.nombre }}
            </div>
          </h6>
        </VListItemTitle>
      </VList>
    </VCardText>
  </VCard>
</template>
