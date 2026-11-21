<script setup lang="ts">
import Fields from '@/views/pages/permissiones/fields.vue'
import type { PermissionInterface } from '@/types/admin/PermisoInterface.ts'

definePageMeta({ middleware: 'permissions', action: 'editar permisos', subject: 'permisos' })

const { put, get } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()
const route = useRoute()
const id = route.params.id
const requestInProgress = ref(false)
const item = ref<PermissionInterface>({ name: null, subject: null, guard_name: null })

const cargar = async () => {
  try {
    paginaEspera.value = true
    const respuesta: { data: PermissionInterface } = await get('api/permissions/' + id)
    item.value = respuesta.data
  }
  catch (error: any) { showToastError(error.message) }
  finally { paginaEspera.value = false }
}

const actualizar = async (data: PermissionInterface): Promise<void> => {
  if (requestInProgress.value) return
  requestInProgress.value = true
  paginaEspera.value = true
  try {
    const respuesta = await put('api/permissions/' + id, data)
    showToastSuccess(respuesta.message)
    navigateTo('/permisos')
  }
  catch (error: any) { showToastError(error.message) }
  finally { paginaEspera.value = false; requestInProgress.value = false }
}

const puedeMostrar = computed(() => Object.values(item.value).some(v => v !== null && v !== undefined))
onMounted(() => cargar())
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1>Editar Permiso</h1>
    <VBtn class="ms-auto" color="secondary" to="/permisos/" prepend-icon="ri-contract-left-fill">
      Regresar
    </VBtn>
  </div>
  <VCard>
    <VCardText>
      <Fields v-if="puedeMostrar" :item="item" @emitir-datos="actualizar" />
    </VCardText>
  </VCard>
</template>
