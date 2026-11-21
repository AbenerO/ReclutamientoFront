<script setup lang="ts">
import { defineEmits, defineProps, nextTick, ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  rol: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create',
  },
})

const emit = defineEmits(['cerrar', 'guardar'])
const { showToastError, showToastSuccess } = useToast()
const { post, put, get } = useClienteRequest()

interface Permissions {
  id: number
  name: string
}

const isFormValid = ref(false)
const refForm = ref(null)
const name = ref('')
const guardName = ref('api')
const permisos = ref<Permissions[]>([])
const permisosDisponibles = ref([])
const permisoSeleccionadoAhora = ref<number[]>([])
const permisosSeleccionadosAntes = ref([])

const cargarPermisosDisponibles = async () => {
  try {
    const response: any = await get('api/permissions')

    // Extraer solo la lista de permisos
    permisosDisponibles.value = response?.data?.data ?? []
  }
  catch (error: any) {
    showToastError(error.response?.data.message?.toString() || error.message)
  }
}

const cargarPermisosRol = async (rolId: number) => {
  try {
    const response: any = await get(`api/roles/${rolId}/permissions`)

    // Verificar si response.data es válido
    if (!response?.data) {
      showToastError('No se encontraron permisos para este rol.')

      return
    }

    // Guardar los objetos completos en permisosSeleccionadosAntes para el DualListBox
    permisosSeleccionadosAntes.value = response.data.map((p: any) => ({
      id: p.id,
      name: p.name, // DualListBox necesita 'name'
    }))

    // También extraer solo los IDs para cuando guardemos
    permisoSeleccionadoAhora.value = response.data.map((p: any) => p.id)
  }
  catch (error: any) {
    showToastError(error.response?.data.message?.toString() || error.message)
  }
}

const guardarRol = async () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (!valid)
      return

    const rolData = {
      data: {
        id: props.rol?.id || null,
        name: name.value,
        guard_name: guardName.value,
        permissions: [...permisoSeleccionadoAhora.value], // 🔹 Asegurar que sea un array normal
      },
    }

    try {
      if (props.mode === 'create') {
        await post('api/roles', rolData)
        showToastSuccess('Rol creado exitosamente')
      }
      else {
        await put(`api/roles/${props.rol.id}`, rolData)
      }

      emit('guardar')
      emit('cerrar')
    }
    catch (error: any) {
      showToastError(error.response?.data.message?.toString() || error.message)
    }
  })
}

const limpiarFormulario = () => {
  name.value = ''
  permisos.value = []
  permisosSeleccionadosAntes.value = []
  permisoSeleccionadoAhora.value = []
}

// Actualizar formulario cuando el rol cambia
watch(
  () => props.visible,
  async isVisible => {
    if (isVisible) {
      limpiarFormulario() // 🔹 Asegurar que se limpia antes de abrir

      if (props.mode === 'edit' && props.rol) {
        name.value = props.rol.name || ''

        await cargarPermisosRol(props.rol.id) // Esperar a que carguen los permisos
        await nextTick() // Esperar a que Vue actualice el DOM antes de mostrar el modal
      }
    }
  },
  { immediate: true },
)

const actualizarPermisoSeleccionados = (permisoSeleccionados: any) => {
  permisoSeleccionadoAhora.value = permisoSeleccionados.map((p: any) => p.id)
}

cargarPermisosDisponibles()
</script>

<template>
  <VDialog
    :model-value="props.visible"
    max-width="1200"
    :fullscreen="$vuetify.display.smAndDown"
    scrollable
    @update:model-value="emit('cerrar')"
  >
    <VCard>
      <VCardTitle class="text=h4 text-center">
        {{ mode === "create" ? "Crear Nuevo Rol" : "Editar Rol" }}
      </VCardTitle>
      <VCardText>
        <VForm
          ref="refForm"
          v-model="isFormValid"
        >
          <VTextField
            v-model="name"
            class="mb-4"
            label="Nombre del Rol"
            :rules="[requiredValidator]"
          />
          <VTextField
            v-model="guardName"
            class="mb-4"
            label="Guard Name"
            disabled
          />
          <DualListBox
            :items="permisosDisponibles"
            :selected-items="permisosSeleccionadosAntes"
            tipo="Permisos"
            @update:selected-items="actualizarPermisoSeleccionados"
          />
        </vform>
      </VCardText>
      <VCardActions>
        <VBtn
          color="error"
          @click="emit('cerrar')"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="success"
          @click="guardarRol"
        >
          {{ mode === "create" ? "Crear Rol" : "Actualizar Rol" }}
        </VBtn>
      </VCardActions>
    </VCard>
  </vdialog>
</template>
