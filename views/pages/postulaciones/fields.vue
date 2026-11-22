<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'

import type { PostulacionInterface } from '@/types/postulaciones/index'

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

const { get } = useClienteRequest()

const usuario = useSanctumUser<{ id: number }>()

const hoy = new Date()
const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

const data = ref<PostulacionInterface>({
  candidato_id: null,
  vacante_id: null,
  fecha_postulacion: fechaHoy,
  estado_postulacion_id: null,
  fuente_reclutamiento_id: null,
  user_id: usuario.value?.id ?? null,
})

interface Emit {

  (e: 'emitirDatos', value: PostulacionInterface): void

}

if (props.item) {
  data.value = props.item
}
else {
  // Al crear, el estado inicial es "Recibida"
  get('api/estados_postulacion?filter[nombre]=Recibida').then((res: any) => {
    data.value.estado_postulacion_id = res?.data?.data?.[0]?.id ?? null
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
        <SelectorPro
          v-model="data.candidato_id"
          endpoint="api/candidatos"
          :label-fn="c => `${c.primer_nombre} ${c.primer_apellido}`"
          :rules="[requiredValidator]"
          :disabled="!!props.item"
          label="Candidato"
          placeholder="Seleccione el candidato"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <SelectorPro
          v-model="data.vacante_id"
          endpoint="api/vacantes"
          :label-fn="v => v.titulo"
          :rules="[requiredValidator]"
          :disabled="!!props.item"
          label="Vacante"
          placeholder="Seleccione la vacante"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VTextField
          :id="useId()"
          v-model="data.fecha_postulacion"
          type="date"
          :rules="[requiredValidator]"
          label="Fecha de Postulación"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <SelectorPro
          v-model="data.estado_postulacion_id"
          endpoint="api/estados_postulacion"
          :label-fn="e => e.nombre"
          :rules="[requiredValidator]"
          label="Estado"
          placeholder="Seleccione el estado"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <SelectorPro
          v-model="data.fuente_reclutamiento_id"
          endpoint="api/fuentes_reclutamiento"
          :label-fn="f => f.nombre"
          :rules="[requiredValidator]"
          label="Fuente de Reclutamiento"
          placeholder="Seleccione la fuente"
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
          to="/postulaciones"
        >
          <VIcon class="me-2 ri-contract-left-fill" />
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
