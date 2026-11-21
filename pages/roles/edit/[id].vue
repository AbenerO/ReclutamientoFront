<script setup lang="ts">
import Fields from '@/views/pages/roles/fields.vue'
import type { RoleInterface } from '@/types/roles/index.ts'

definePageMeta({ middleware: 'permissions', action: 'editar roles', subject: 'Role' })

const { put, get } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()
const route = useRoute()
const id = route.params.id
const requestInProgress = ref(false)
const item = ref<RoleInterface>({ name: null, guard_name: null })

const cargar = async () => {
  try {
    paginaEspera.value = true
    const respuesta: { data: RoleInterface } = await get('api/roles/' + id)
    item.value = respuesta.data
  }
  catch (error: any) { showToastError(error.message) }
  finally { paginaEspera.value = false }
}

const actualizar = async (data: RoleInterface): Promise<void> => {
  if (requestInProgress.value) return
  requestInProgress.value = true
  paginaEspera.value = true
  try {
    const respuesta = await put('api/roles/' + id, data)
    showToastSuccess(respuesta.message)
    navigateTo('/roles')
  }
  catch (error: any) { showToastError(error.message) }
  finally { paginaEspera.value = false; requestInProgress.value = false }
}

const puedeMostrar = computed(() => Object.values(item.value).some(v => v !== null && v !== undefined))
onMounted(() => cargar())
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1>Editar Rol</h1>
    <VBtn class="ms-auto" color="secondary" to="/roles/" prepend-icon="ri-contract-left-fill">
      Regresar
    </VBtn>
  </div>
  <VCard>
    <VCardText>
      <Fields v-if="puedeMostrar" :item="item" @emitir-datos="actualizar" />
    </VCardText>
  </VCard>
</template>
