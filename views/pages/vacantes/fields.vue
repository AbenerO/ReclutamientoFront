<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'

import type { VacanteInterface } from '@/types/vacantes/index'

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

const usuario = useSanctumUser<{ id: number }>()

const data = ref<VacanteInterface>({
  unidad_id: null,
  titulo: null,
  descripcion: null,
  modalidad_id: null,
  salario_minimo: null,
  salario_maximo: null,
  ubicacion: null,
  estado_vacante_id: null,
  user_id: usuario.value?.id ?? null,
})

interface Emit {

  (e: 'emitirDatos', value: VacanteInterface): void

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
          v-model="data.titulo"
          :rules="[requiredValidator]"
          label="Título"
          placeholder="Ingrese el título del puesto"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.unidad_id"
          endpoint="api/unidades"
          :label-fn="u => u.nombre"
          :rules="[requiredValidator]"
          label="Unidad"
          placeholder="Seleccione la unidad"
        />
      </VCol>

      <VCol cols="12">
        <VTextarea
          :id="useId()"
          v-model="data.descripcion"
          :rules="[requiredValidator]"
          label="Descripción"
          placeholder="Ingrese la descripción del puesto"
          rows="3"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.modalidad_id"
          endpoint="api/modalidades"
          :label-fn="m => m.nombre"
          :rules="[requiredValidator]"
          label="Modalidad"
          placeholder="Seleccione la modalidad"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.estado_vacante_id"
          endpoint="api/estados_vacante"
          :label-fn="e => e.nombre"
          :rules="[requiredValidator]"
          label="Estado"
          placeholder="Seleccione el estado"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.salario_minimo"
          type="number"
          min="0"
          :rules="[requiredValidator]"
          label="Salario Mínimo (Q)"
          placeholder="Ingrese el salario mínimo"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.salario_maximo"
          type="number"
          min="0"
          :rules="[requiredValidator]"
          label="Salario Máximo (Q)"
          placeholder="Ingrese el salario máximo"
        />
      </VCol>

      <VCol cols="12">
        <VTextField
          :id="useId()"
          v-model="data.ubicacion"
          :rules="[requiredValidator]"
          label="Ubicación"
          placeholder="Ingrese la ubicación"
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
          to="/vacantes"
        >
          <VIcon class="me-2 ri-contract-left-fill" />
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
