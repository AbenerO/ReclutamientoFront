<script setup lang="ts">
import { ref } from 'vue'
import type { VacanteInterface } from '@/types/vacantes/index'

definePageMeta({
  middleware: 'permissions',
  action: 'ver vacantes',
  subject: 'Vacante',
})

const { get } = useClienteRequest()

const { showToastError } = useToast()

const route = useRoute()

const id = route.params.id

const { paginaEspera } = useCargandoPagina()

const item = ref<VacanteInterface>({
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

    const respuesta: { data: VacanteInterface } = await get(`api/vacantes/${id}?include=unidad,modalidad,estadoVacante`)

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

getVacante()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Visualizar Vacante'" />
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
      <VList
        v-if="puedeMostrarDatos"
        class="card-list mt-2"
      >
        <VListItemTitle>
          <h6 class="text-h6">
            Unidad:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.unidad?.nombre }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Título:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.titulo }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Descripción:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.descripcion }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Modalidad:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.modalidad?.nombre }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Salario Mínimo:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ formatearQuetzales(item.salario_minimo) }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Salario Máximo:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ formatearQuetzales(item.salario_maximo) }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Ubicación:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.ubicacion }}
            </div>
          </h6>
        </VListItemTitle>

        <VListItemTitle>
          <h6 class="text-h6">
            Estado:
            <div class="d-inline-block text-capitalize text-body-1">
              {{ item.estado_vacante?.nombre }}
            </div>
          </h6>
        </VListItemTitle>
      </VList>
    </VCardText>
  </VCard>
</template>
