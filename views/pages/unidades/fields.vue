<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'

import type { UnidadInterface } from '@/types/unidades/index'

const props = defineProps({
  item: {
    type: Object || null,
    default: null,
  },
},
)

const emit = defineEmits<Emit>()

const isFormValid = ref(false)

const refForm = ref<VForm>()

const data = ref<UnidadInterface>({
  nombre: null,
  descripcion: null,
  activo: true,
})

interface Emit {

  (e: 'emitirDatos', value: UnidadInterface): void

}

if (props.item)
  data.value = props.item

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid)
      emit('emitirDatos', data.value)
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
      <VCol
        cols="12"
        md="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.nombre"
          :rules="[requiredValidator, v => !v || v.length <= 100 || 'Máximo 100 caracteres']"
          label="Nombre"
          counter="100"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.descripcion"
          :rules="[v => !v || v.length <= 255 || 'Máximo 255 caracteres']"
          label="Descripción"
          counter="255"
        />
      </VCol>

      <VCol cols="12">
        <VSwitch
          :id="useId()"
          v-model="data.activo"
          label="Activa"
        />
      </VCol>

      <VCol cols="12">
        <VBtn
          type="submit"
          class="me-3"
        >
          <VIcon class="me-2 ri-save-3-fill" />
          Guardar
        </VBtn>
        <VBtn
          type="reset"
          variant="tonal"
          color="error"
          to="/unidades"
        >
          <VIcon class="me-2 ri-contract-left-fill" />
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
