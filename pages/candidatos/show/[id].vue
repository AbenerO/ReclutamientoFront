<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'ver candidatos',
  subject: 'Candidato',
})

import type { CandidatoInterface } from '@/types/candidatos/index.ts';

import {ref} from "vue";

const { get } = useClienteRequest();

const { showToastSuccess, showToastError } = useToast();

const route = useRoute();

const id = route.params.id;

const { paginaEspera } = useCargandoPagina();

const item = ref( <CandidatoInterface>
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

    item.value = respuesta.data;


  } catch (error: { message: string }) {

    showToastError(error.message);

  }

  paginaEspera.value = false;

}

const puedeMostrarDatos = computed(() => {

  return Object.values(item.value).some(valor => valor !== null && valor !== undefined);

});

getCandidato();

</script>

<template>

  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Visualizar Candidato'"/>
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

      <VList class="card-list mt-2" v-if="puedeMostrarDatos">

        
              <VListItemTitle>
                <h6 class="text-h6">
                    Primer Nombre:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.primer_nombre }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Segundo Nombre:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.segundo_nombre }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Tercer Nombre:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.tercer_nombre }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Primer Apellido:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.primer_apellido }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Segundo Apellido:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.segundo_apellido }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Apellido Casada:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.apellido_casada }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Email:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.email }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Telefono:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.telefono }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Fecha Nacimiento:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.fecha_nacimiento }}
                  </div>
                </h6>
              </VListItemTitle>
            
              <VListItemTitle>
                <h6 class="text-h6">
                    Expectativa Salarial:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.expectativa_salarial }}
                  </div>
                </h6>
              </VListItemTitle>
            

      </VList>

    </VCardText>

  </VCard>

</template>

<style scoped lang="scss">

</style>
