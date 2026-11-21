<script setup lang="ts">

definePageMeta({
  middleware: 'permissions',
  action: 'ver roles',
  subject: 'Role',
});

import type { RoleInterface } from '@/types/roles/index.ts';

const { get } = useClienteRequest();

const { showToastError } = useToast();

const route = useRoute();

const id = route.params.id;

const { paginaEspera } = useCargandoPagina();

const item = ref<RoleInterface>({
  name: null,
  guard_name: null,
})

const permisos = ref<{ id: number, name: string, subject: string }[]>([])
const cargandoPermisos = ref(false)

const getRole = async () => {
  try {
    paginaEspera.value = true;

    const respuesta: { data: RoleInterface } = await get('api/roles/' + id );

    item.value = respuesta.data;
  } catch (error: any) {
    showToastError(error.message);
  }

  paginaEspera.value = false;
}

const getPermisosDelRole = async () => {
  cargandoPermisos.value = true
  try {
    const respuesta: { data: { id: number, name: string, subject: string }[] } = await get(`api/roles/${id}/permissions`)
    permisos.value = respuesta.data
  } catch (error: any) {
    showToastError(error.message)
  } finally {
    cargandoPermisos.value = false
  }
}

const permisosPorSubject = computed(() => {
  const grupos: Record<string, { id: number, name: string, subject: string }[]> = {}
  for (const permiso of permisos.value) {
    const clave = permiso.subject || 'Otros'
    if (!grupos[clave])
      grupos[clave] = []
    grupos[clave].push(permiso)
  }
  return grupos
})

const puedeMostrarDatos = computed(() => {
  return Object.values(item.value).some(valor => valor !== null && valor !== undefined);
});

onMounted(() => { getRole(); getPermisosDelRole() })
</script>

<template>

  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-6">
    <h1 v-text="'Visualizar Role'"/>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/roles/"
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
            v-if="item.guard_name"
            size="small"
            variant="tonal"
            color="secondary"
          >
            {{ item.guard_name }}
          </VChip>
          <VChip
            size="small"
            variant="tonal"
            color="primary"
          >
            {{ permisos.length }} permiso{{ permisos.length === 1 ? '' : 's' }}
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
          ri-key-line
        </VIcon>
        Permisos Asignados
      </VCardTitle>
      <VDivider />
      <VCardText>
        <div v-if="cargandoPermisos" class="text-center py-4">
          <VProgressCircular indeterminate color="primary" size="28" />
        </div>
        <div v-else-if="permisos.length === 0" class="text-center py-4 text-medium-emphasis">
          Este rol no tiene permisos asignados.
        </div>
        <div v-else>
          <div
            v-for="(grupo, subject) in permisosPorSubject"
            :key="subject"
            class="mb-4"
          >
            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ subject }}
            </p>
            <div class="d-flex flex-wrap gap-2">
              <VChip
                v-for="permiso in grupo"
                :key="permiso.id"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="ri-key-line"
              >
                {{ permiso.name }}
              </VChip>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>
  </template>

</template>
