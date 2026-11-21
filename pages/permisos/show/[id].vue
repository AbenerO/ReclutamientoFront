<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'ver permisos',
  subject: 'permisos',
});

import type { PermisoInterface } from '@/types/admin/PermisoInterface.ts';

const {get} = useClienteRequest();

const {showToastError} = useToast();

const route = useRoute();

const id = route.params.id;

const {paginaEspera} = useCargandoPagina();

const item = ref<PermisoInterface>({
  name: null,
  subject: null,
  guard_name: null,
})

const roles = ref<{ id: number, name: string }[]>([])
const cargandoRoles = ref(false)

const getPermission = async () => {
  try {
    paginaEspera.value = true;

    const respuesta: { data: PermisoInterface } = await get('api/permissions/' + id);

    item.value = respuesta.data;
  } catch (error: any) {
    showToastError(error.message);
  }

  paginaEspera.value = false;
}

const getRolesConEstePermiso = async () => {
  cargandoRoles.value = true
  try {
    const respuesta: { data: { id: number, name: string }[] } = await get(`api/permissions/${id}/roles`)
    roles.value = respuesta.data
  } catch (error: any) {
    showToastError(error.message)
  } finally {
    cargandoRoles.value = false
  }
}

const puedeMostrarDatos = computed(() => {
  return Object.values(item.value).some(valor => valor !== null && valor !== undefined);
});

onMounted(() => { getPermission(); getRolesConEstePermiso() })
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Visualizar Permiso'"/>
    <VBtn
        class="ml-auto"
        color="secondary"
        to="/permisos/"
    >
      <VIcon class="mr-2 ri-contract-left-fill"/>
      Regresar
    </VBtn>
  </div>

  <template v-if="puedeMostrarDatos">
    <VCard class="mb-6">
      <VCardText>
        <h4 class="text-h4 mb-2">
          {{ item.name || '—' }}
        </h4>
        <div class="d-flex flex-wrap gap-2">
          <VChip
            v-if="item.subject"
            size="small"
            variant="tonal"
            color="primary"
          >
            {{ item.subject }}
          </VChip>
          <VChip
            v-if="item.guard_name"
            size="small"
            variant="tonal"
            color="secondary"
          >
            {{ item.guard_name }}
          </VChip>
        </div>
      </VCardText>
    </VCard>

    <VCard>
      <VCardTitle class="pa-4 pb-2 d-flex align-center gap-2">
        <VIcon
          color="primary"
          size="20"
        >
          ri-shield-user-line
        </VIcon>
        Roles con este Permiso
      </VCardTitle>
      <VDivider />
      <VCardText>
        <div v-if="cargandoRoles" class="text-center py-4">
          <VProgressCircular indeterminate color="primary" size="28" />
        </div>
        <div v-else-if="roles.length === 0" class="text-center py-4 text-medium-emphasis">
          Ningún rol tiene asignado este permiso.
        </div>
        <div v-else class="d-flex flex-wrap gap-2">
          <VChip
            v-for="rol in roles"
            :key="rol.id"
            size="small"
            variant="tonal"
            color="secondary"
            prepend-icon="ri-shield-user-line"
          >
            {{ rol.name }}
          </VChip>
        </div>
      </VCardText>
    </VCard>
  </template>
</template>
