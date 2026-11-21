<script setup lang="ts">
import Fields from '@/views/pages/usuarios/fields.vue'
import type { UsuarioInterface } from '@/types/usuarios'

definePageMeta({
  middleware: 'permissions',
  action: 'editar usuarios',
  subject: 'User',
})

const { get, put } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()
const route = useRoute()
const id = route.params.id
const requestInProgress = ref(false)

const item = ref<UsuarioInterface>({
  id: null,
  primer_nombre: null,
  primer_apellido: null,
  username: null,
  email: null,
})

const getUsuario = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get(`api/usuarios/${id}`)
    item.value = respuesta.data
  }
  catch (error: any) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
  }
}

const puedeMostrarDatos = computed(() =>
  Object.values(item.value).some(v => v !== null && v !== undefined),
)

const actualizarUsuario = async (usuario: UsuarioInterface) => {
  if (requestInProgress.value)
    return

  requestInProgress.value = true
  paginaEspera.value = true

  try {
    const respuesta = await put(`api/usuarios/${id}`, usuario)
    showToastSuccess(respuesta.message)
    navigateTo('/admin/usuarios')
  }
  catch (error: any) {
    showToastError(error.message)
  }
  finally {
    paginaEspera.value = false
    requestInProgress.value = false
  }
}

onMounted(() => getUsuario())
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Editar Usuario'" />
    <VBtn class="ml-auto" color="secondary" to="/admin/usuarios">
      <VIcon class="mr-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="puedeMostrarDatos"
        :item="item"
        @emitir-datos="actualizarUsuario"
      />
    </VCardText>
  </VCard>
</template>
