<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'crear candidatos',
  subject: 'Candidato',
})

import fields from '@/views/pages/candidatos/fields.vue'

import type { CandidatoInterface } from '@/types/candidatos/index.ts';

import {ref} from "vue";

const { post  } = useClienteRequest();

const { showToastSuccess, showToastError } = useToast();

const requestInProgress = ref(false) // Evitar solicitudes concurrentes
const { paginaEspera } = useCargandoPagina();

const guardarCandidato = async ( Candidato: CandidatoInterface ): Promise<void> => {

  if (!requestInProgress.value) {

    requestInProgress.value = true // Establecer bandera de solicitud en progreso
    paginaEspera.value = true // Activar indicador de carga

    try {

      const respuesta: { message: string } = await post('api/candidatos', Candidato );

      showToastSuccess(respuesta.message);

      navigateTo('/candidatos');

    } catch (error: any) {

      showToastError(error.message);

    }  finally {

      paginaEspera.value = false // Desactivar indicador de carga
      requestInProgress.value = false // Liberar la bandera

    }
  }

}

</script>

<template>

  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Crear Candidato'"/>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/candidatos/"
    >
      <VIcon class="mr-2 ri-contract-left-fill"/>
      Regresar
    </VBtn>

  </div>

  <VCard>

    <VCardText>

      <fields :fields="fields"
              @emitirDatos="guardarCandidato"
      />

    </VCardText>

  </VCard>

</template>

<style scoped lang="scss">

</style>
