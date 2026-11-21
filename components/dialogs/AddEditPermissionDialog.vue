<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

interface Props {
  isDialogVisible: boolean
  permission?: { id?: number; name: string; subject: string; guard_name: string } | null
}
interface Emit {
  (e: 'update:isDialogVisible', value: boolean): void
  (e: 'saved'): void
}

const props = withDefaults(defineProps<Props>(), { permission: null })
const emit = defineEmits<Emit>()

const { post, put } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()

const refForm = ref<VForm>()
const loading = ref(false)

const formData = ref({ name: '', subject: '', guard_name: 'api' })

const isEditing = computed(() => !!props.permission?.id)

watch(() => props.isDialogVisible, (val) => {
  if (val) {
    formData.value = props.permission
      ? { name: props.permission.name, subject: props.permission.subject, guard_name: 'api' }
      : { name: '', subject: '', guard_name: 'api' }
    nextTick(() => refForm.value?.resetValidation())
  }
})

const onReset = () => {
  emit('update:isDialogVisible', false)
}

const onSubmit = async () => {
  const result = await refForm.value?.validate()
  if (!result?.valid)
    return

  loading.value = true
  try {
    const payload = {
      name: formData.value.name,
      subject: formData.value.subject,
      guard_name: 'api',
    }

    let res: any
    if (isEditing.value)
      res = await put(`api/permissions/${props.permission!.id}`, payload)
    else
      res = await post('api/permissions', payload)

    showToastSuccess(res?.message ?? 'Permiso guardado con éxito')
    emit('update:isDialogVisible', false)
    emit('saved')
  }
  catch (e: any) {
    showToastError(e?.message ?? 'Error al guardar el permiso')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    @update:model-value="onReset"
  >
    <VCard class="pa-sm-8 pa-5">
      <DialogCloseBtn variant="text" size="default" @click="onReset" />

      <VCardText class="mt-5">
        <!-- Título -->
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            {{ isEditing ? 'Editar' : 'Agregar' }} Permiso
          </h4>
          <p class="text-body-1 text-medium-emphasis">
            {{ isEditing ? 'Modifica' : 'Agrega' }} un permiso según tus requerimientos.
          </p>
        </div>

        <!-- Alerta de advertencia -->
        <VAlert type="warning" variant="tonal" class="mb-6">
          Al {{ isEditing ? 'editar' : 'agregar' }} un permiso puedes afectar el funcionamiento del sistema.
          Asegúrate de que los valores sean correctos antes de continuar.
        </VAlert>

        <!-- Formulario -->
        <VForm ref="refForm" @submit.prevent="onSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                :id="useId()"
                v-model="formData.name"
                label="Nombre del permiso"
                placeholder="Ej: ver usuarios"
                :rules="[requiredValidator]"
                density="compact"
                hint="Ej: ver usuarios, crear menu, editar roles"
                persistent-hint
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                :id="useId()"
                v-model="formData.subject"
                label="Subject (CASL)"
                placeholder="Ej: User, Role, MenuOpcion"
                :rules="[requiredValidator]"
                density="compact"
                hint="Nombre del modelo o recurso que controla este permiso"
                persistent-hint
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                :id="useId()"
                v-model="formData.guard_name"
                label="Guard"
                disabled
                density="compact"
              />
            </VCol>

            <VCol cols="12" class="d-flex gap-3 justify-end">
              <VBtn variant="outlined" color="secondary" @click="onReset">
                Cancelar
              </VBtn>
              <VBtn type="submit" :loading="loading">
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>