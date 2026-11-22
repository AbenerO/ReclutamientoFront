<script setup lang="ts">

import type {VForm} from "vuetify/lib/components/VForm";

const isFormValid = ref(false)

const refForm = ref<VForm>()

import type { CandidatoInterface } from '@/types/candidatos/index.ts';

const data = ref( <CandidatoInterface>
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

interface Emit {

  (e: 'emitirDatos', value: CandidatoInterface ): void

}

const props = defineProps({
    item: {
      type: Object || null,
      default: null
    }
  }
)
const emit = defineEmits<Emit>()

if (props.item) {
  data.value = props.item
}

const onSubmit = () => {

  refForm.value?.validate().then(({valid}) => {

    if (valid) {

      emit('emitirDatos', data.value)

    }

  })

}

</script>

<template>

  <VForm
    ref="refForm"
    v-model="isFormValid"
    @submit.prevent="onSubmit"
  >
    <VRow>
    
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.primer_nombre"
                    :rules="[requiredValidator]"
                    label="Primer Nombre"
                    placeholder="Ingrese Primer Nombre"
                    required
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.segundo_nombre"
                    label="Segundo Nombre"
                    placeholder="Ingrese Segundo Nombre"
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.tercer_nombre"
                    label="Tercer Nombre"
                    placeholder="Ingrese Tercer Nombre"
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.primer_apellido"
                    :rules="[requiredValidator]"
                    label="Primer Apellido"
                    placeholder="Ingrese Primer Apellido"
                    required
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.segundo_apellido"
                    label="Segundo Apellido"
                    placeholder="Ingrese Segundo Apellido"
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.apellido_casada"
                    label="Apellido de Casada"
                    placeholder="Ingrese Apellido de Casada"
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.email"
                    type="email"
                    :rules="[requiredValidator, emailValidator]"
                    label="Email"
                    placeholder="Ingrese Email"
                    required
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.telefono"
                    :rules="[requiredValidator]"
                    label="Telefono"
                    placeholder="Ingrese Telefono"
                    required
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.fecha_nacimiento"
                    type="date"
                    :rules="[requiredValidator]"
                    label="Fecha de Nacimiento"
                    required
                />
            </VCol>
        
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.expectativa_salarial"
                    type="number"
                    min="0"
                    :rules="[requiredValidator]"
                    label="Expectativa Salarial"
                    placeholder="Ingrese Expectativa Salarial"
                    required
                />
            </VCol>
        
      <VCol cols="12">
        <VBtn
          type="submit"
          class="me-3"
        >
          <VIcon class="mr-2 ri-save-3-fill"/>
          Guardar
        </VBtn>
        <VBtn
          type="reset"
          variant="tonal"
          color="error"
          to="/candidatos"
        >
          <VIcon class="mr-2 ri-contract-left-fill"/>
          Cancelar
        </VBtn>
      </VCol>
    </VRow>

  </VForm>

</template>

<style scoped lang="scss">

</style>
