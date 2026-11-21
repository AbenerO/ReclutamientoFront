<script setup lang="ts">
import Fields from '@/views/pages/usuarios/fields.vue'
import type { UsuarioInterface } from '@/types/usuarios'

definePageMeta({
  middleware: 'permissions',
  action: 'crear usuarios',
  subject: 'User',
})

const { post } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()
const requestInProgress = ref(false)

const guardarUsuario = async (usuario: UsuarioInterface) => {
  if (requestInProgress.value)
    return

  requestInProgress.value = true
  paginaEspera.value = true

  try {
    const respuesta = await post('api/usuarios', usuario)
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
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Crear Usuario'" />
    <VBtn class="ml-auto" color="secondary" to="/admin/usuarios">
      <VIcon class="mr-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarUsuario" />
    </VCardText>
  </VCard>
</template>
