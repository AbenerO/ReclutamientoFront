<script setup lang="ts">
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

const { get, put } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()

const dataTableRef = ref(null)

const headers = [
  { key: 'candidato', title: 'Candidato', value: 'candidato', exportValue: (i: any) => `${i.candidato?.primer_nombre ?? ''} ${i.candidato?.primer_apellido ?? ''}`.trim() },
  { key: 'vacante', title: 'Vacante', value: 'vacante', exportValue: (i: any) => i.vacante?.titulo },
  { key: 'fecha_postulacion', title: 'Fecha de Postulación', value: 'fecha_postulacion', exportValue: (i: any) => formatearFecha(i.fecha_postulacion) },
  { key: 'fuente', title: 'Fuente', value: 'fuente', exportValue: (i: any) => i.fuente_reclutamiento?.nombre },
  { key: 'estado', title: 'Estado', value: 'estado', exportValue: (i: any) => i.estado_postulacion?.nombre },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

// Catálogos para los filtros y para el cambio de estado
const vacantes = ref<any[]>([])
const estados = ref<any[]>([])

const cargarCatalogos = async () => {
  const [vacantesRes, estadosRes] = await Promise.all([
    get('api/vacantes?per_page=100'),
    get('api/estados_postulacion?per_page=100'),
  ])

  vacantes.value = vacantesRes?.data?.data ?? []
  estados.value = (estadosRes?.data?.data ?? []).sort((a: any, b: any) => a.orden - b.orden)
}

cargarCatalogos()

// Filtros: listar las postulaciones de una vacante, y por estado
const filtrosUi = reactive({
  vacante_id: null as number | null,
  estado_postulacion_id: null as number | null,
})

const filtros = computed(() => {
  const f: Record<string, any> = {}

  if (filtrosUi.vacante_id)
    f.vacante_id = filtrosUi.vacante_id
  if (filtrosUi.estado_postulacion_id)
    f.estado_postulacion_id = filtrosUi.estado_postulacion_id

  return f
})

// Operación Ajax: cambia el estado sin recargar la página
const cambiarEstado = async (item: any, estadoId: number) => {
  try {
    const respuesta = await put(`api/postulaciones/${item.id}/estado`, { estado_postulacion_id: estadoId })

    showToastSuccess(respuesta.message)
  }
  catch (error: any) {
    showToastError(error.message)
  }

  // Se refresca la tabla para mostrar el estado real (si falló, vuelve al anterior)
  dataTableRef.value?.getItems()
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de postulaciones'" />
    <VBtn
      v-if="can('crear postulaciones', 'Postulacion')"
      class="ms-auto"
      color="success"
      to="/postulaciones/create"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Nueva Postulación
    </VBtn>
  </div>

  <VCard class="mb-4">
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          sm="6"
        >
          <VAutocomplete
            v-model="filtrosUi.vacante_id"
            :items="vacantes"
            item-title="titulo"
            item-value="id"
            label="Vacante"
            placeholder="Todas las vacantes"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <VSelect
            v-model="filtrosUi.estado_postulacion_id"
            :items="estados"
            item-title="nombre"
            item-value="id"
            label="Estado"
            placeholder="Todos los estados"
            clearable
            density="compact"
            variant="outlined"
            hide-details
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/postulaciones"
    :relaciones="['candidato', 'vacante', 'estadoPostulacion', 'fuenteReclutamiento']"
    :filtros="filtros"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.candidato="{ item }">
      <span v-text="`${item.candidato?.primer_nombre} ${item.candidato?.primer_apellido}`" />
    </template>

    <template #item.vacante="{ item }">
      <span v-text="item.vacante?.titulo" />
    </template>

    <template #item.fecha_postulacion="{ item }">
      <span v-text="formatearFecha(item.fecha_postulacion)" />
    </template>

    <template #item.fuente="{ item }">
      <span v-text="item.fuente_reclutamiento?.nombre" />
    </template>

    <template #item.estado="{ item }">
      <VSelect
        v-if="can('editar postulaciones', 'Postulacion')"
        :model-value="item.estado_postulacion_id"
        :items="estados"
        item-title="nombre"
        item-value="id"
        density="compact"
        variant="outlined"
        hide-details
        style="min-inline-size: 160px;"
        @update:model-value="cambiarEstado(item, $event)"
      />
      <span
        v-else
        v-text="item.estado_postulacion?.nombre"
      />
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver postulaciones', 'Postulacion')"
        icon="ri-eye-line"
        variant="tonal"
        color="info"
        :to="`/postulaciones/show/${item.id}`"
        class="me-1"
      />
      <VBtn
        v-if="can('editar postulaciones', 'Postulacion')"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        :to="`/postulaciones/edit/${item.id}`"
      />
    </template>
  </DataTableComponent>
</template>
