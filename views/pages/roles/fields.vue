<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'

import type { RoleInterface } from '@/types/roles'

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

const data = ref<RoleInterface>({
  name: null,
  guard_name: 'api',
})

interface Emit {

  (e: 'emitirDatos', value: RoleInterface): void

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
        sm="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.name"
          :rules="[requiredValidator]"
          label="Name"
          placeholder="Ingrese Name"
          required
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
        sm="6"
      >
        <VTextField
          :id="useId()"
          v-model="data.guard_name"
          :rules="[requiredValidator]"
          label="Guard Name"
          placeholder="api"
          disabled
          required
        />
      </VCol>

      <VCol cols="12">
        <VBtn
          type="submit"
          class="me-3"
        >
          <VIcon class="mr-2 ri-save-3-fill" />
          Submit
        </VBtn>
        <VBtn
          type="reset"
          variant="tonal"
          color="error"
          to="/roles"
        >
          <VIcon class="mr-2 ri-contract-left-fill" />
          Cancel
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
