<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'

import type { EntrevistaInterface } from '@/types/entrevistas/index'

const props = defineProps({
  item: {
    type: Object || null,
    default: null,
  },
  postulacionId: {
    type: Number,
    required: true,
  },
},
)

const emit = defineEmits<Emit>()

const isFormValid = ref(false)

const refForm = ref<VForm>()

const { get } = useClienteRequest()

const usuario = useSanctumUser<{ id: number }>()

const data = ref<EntrevistaInterface>({
  postulacion_id: props.postulacionId,
  fecha_hora: null,
  tipo_entrevista_id: null,
  entrevistador_id: null,
  resultado_entrevista_id: null,
  observaciones: null,
  user_id: usuario.value?.id ?? null,
})

interface Emit {

  (e: 'emitirDatos', value: EntrevistaInterface): void
  (e: 'cancelar'): void

}

if (props.item) {
  data.value = {
    ...props.item,
    fecha_hora: props.item.fecha_hora?.slice(0, 16) ?? null,
  }
}
else {
  get('api/resultados_entrevista?filter[nombre]=Pendiente').then((res: any) => {
    data.value.resultado_entrevista_id = res?.data?.data?.[0]?.id ?? null
  })
}

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
          v-model="data.fecha_hora"
          type="datetime-local"
          :rules="[requiredValidator]"
          label="Fecha y hora"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.tipo_entrevista_id"
          endpoint="api/tipos_entrevista"
          :label-fn="t => t.nombre"
          :rules="[requiredValidator]"
          label="Tipo de entrevista"
          placeholder="Seleccione el tipo"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.entrevistador_id"
          endpoint="api/usuarios"
          :label-fn="u => `${u.primer_nombre} ${u.primer_apellido}`"
          :rules="[requiredValidator]"
          label="Entrevistador"
          placeholder="Seleccione el entrevistador"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.resultado_entrevista_id"
          endpoint="api/resultados_entrevista"
          :label-fn="r => r.nombre"
          :rules="[requiredValidator]"
          label="Resultado"
          placeholder="Seleccione el resultado"
        />
      </VCol>

      <VCol cols="12">
        <VTextarea
          :id="useId()"
          v-model="data.observaciones"
          label="Observaciones"
          rows="3"
          counter="500"
          :rules="[v => !v || v.length <= 500 || 'Máximo 500 caracteres']"
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
          variant="tonal"
          color="error"
          @click="emit('cancelar')"
        >
          <VIcon class="me-2 ri-contract-left-fill" />
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
