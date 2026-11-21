<script setup lang="ts">
import type { UsuarioInterface } from '@/types/usuarios'

definePageMeta({
  middleware: 'permissions',
  action: 'ver usuarios',
  subject: 'User',
})

const { get } = useClienteRequest()
const { showToastError } = useToast()
const { paginaEspera } = useCargandoPagina()
const route = useRoute()
const id = route.params.id

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

onMounted(() => getUsuario())
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Detalle de Usuario'" />
    <VBtn class="ml-auto" color="secondary" to="/admin/usuarios">
      <VIcon class="mr-2 ri-contract-left-fill" />
      Regresar
    </VBtn>
  </div>

  <VCard v-if="puedeMostrarDatos">
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Nombre Completo</p>
          <p class="text-body-1">{{ item.nombre_completo }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Username</p>
          <p class="text-body-1">{{ item.username }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Correo Electrónico</p>
          <p class="text-body-1">{{ item.email }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Rol</p>
          <VChip
            v-for="rol in item.roles"
            :key="rol.id"
            color="primary"
            size="small"
            class="me-1"
          >
            {{ rol.name }}
          </VChip>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">DPI</p>
          <p class="text-body-1">{{ item.dpi ?? '—' }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Género</p>
          <p class="text-body-1">{{ item.genero ?? '—' }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Fecha de Nacimiento</p>
          <p class="text-body-1">{{ item.fecha_nacimiento ?? '—' }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Teléfono</p>
          <p class="text-body-1">{{ item.telefono ?? '—' }}</p>
        </VCol>
        <VCol cols="12" md="6">
          <p class="text-overline mb-1">Estado</p>
          <VChip :color="item.estado ? 'success' : 'error'" size="small">
            {{ item.estado ? 'Activo' : 'Inactivo' }}
          </VChip>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
