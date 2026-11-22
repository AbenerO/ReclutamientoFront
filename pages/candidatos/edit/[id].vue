<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'editar candidatos',
  subject: 'Candidato',
})

import fields from '@/views/pages/candidatos/fields.vue'

import type { CandidatoInterface } from '@/types/candidatos/index.ts';

import {ref} from "vue";

const { put, get  } = useClienteRequest();

const { showToastSuccess, showToastError } = useToast();

const route = useRoute();

const id = route.params.id;

const Candidato = ref(fields);

const { paginaEspera } = useCargandoPagina();
const requestInProgress = ref(false); // Evitar solicitudes concurrentes

const actualizarCandidato = async ( Candidato: CandidatoInterface ): Promise<void> => {

  if (!requestInProgress.value) {

    paginaEspera.value = true;
    requestInProgress.value = true;

    try {

      const respuesta = await put('api/candidatos/' + id, Candidato );

      showToastSuccess(respuesta.message);

      navigateTo('/candidatos');

    } catch (error) {

      showToastError(error.message);

    } finally {

      paginaEspera.value = false;
      requestInProgress.value = false;

    }

  }

}

const itemCandidato = ref( <CandidatoInterface>
{ primer_nombre: null,
segundo_nombre: null,
tercer_nombre: null,
primer_apellido: null,
segundo_apellido: null,
apellido_casada: null,
email: null,
telefono: null,
fecha_nacimiento: null,
expectativa_salarial: null }
)

const getCandidato = async () => {

  try {

    paginaEspera.value = true;

    const respuesta: { data: CandidatoInterface } = await get('api/candidatos/' + id );

    itemCandidato.value = respuesta.data;

  } catch (error: { message: string }) {

    showToastError(error.message);

  }

  paginaEspera.value = false;

}

getCandidato();

const puedeMostrarDatos = computed(() => {

  return Object.values(itemCandidato .value).some(valor => valor !== null && valor !== undefined);

});

</script>

<template>

  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Editar Candidato'"/>
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
                v-if="puedeMostrarDatos"
                :item="itemCandidato"
                @emitirDatos="actualizarCandidato"
        />

      </VCardText>

  </VCard>

</template>

<style scoped lang="scss">

</style>
