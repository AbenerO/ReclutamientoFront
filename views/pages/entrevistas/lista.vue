<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import Fields from '@/views/pages/entrevistas/fields.vue'
import type { EntrevistaInterface } from '@/types/entrevistas/index'

const props = defineProps({
  postulacionId: {
    type: Number,
    required: true,
  },

  bloqueada: {
    type: Boolean,
    default: false,
  },
})

const { post, put } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()
const dataTableRef = ref(null)

const headers = [
  { key: 'fecha_hora', title: 'Fecha y hora', value: 'fecha_hora' },
  { key: 'tipo', title: 'Tipo', value: 'tipo' },
  { key: 'entrevistador', title: 'Entrevistador', value: 'entrevistador' },
  { key: 'resultado', title: 'Resultado', value: 'resultado' },
  { key: 'observaciones', title: 'Observaciones', value: 'observaciones' },
  { key: 'Acciones', title: 'Acciones', value: 'Acciones' },
]

const filtros = computed(() => ({ postulacion_id: props.postulacionId }))

const mostrarDialogo = ref(false)
const entrevistaEditar = ref<any>(null)

const agendar = () => {
  entrevistaEditar.value = null
  mostrarDialogo.value = true
}

const editar = (item: any) => {
  entrevistaEditar.value = item
  mostrarDialogo.value = true
}

const formatearFechaHora = (fecha: string | null) => fecha ? fecha.slice(0, 16).replace('T', ' ') : ''

const colorResultado = (nombre: string | undefined) => {
  if (nombre === 'Aprobado')
    return 'success'
  if (nombre === 'No aprobado')
    return 'error'

  return 'warning'
}

const guardarEntrevista = async (entrevista: EntrevistaInterface) => {
  try {
    const respuesta: { message: string } = entrevistaEditar.value
      ? await put(`api/entrevistas/${entrevistaEditar.value.id}`, entrevista)
      : await post('api/entrevistas', entrevista)

    showToastSuccess(respuesta.message)

    mostrarDialogo.value = false
    dataTableRef.value?.getItems()
  }
  catch (error: any) {
    showToastError(error.message)
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 my-6">
    <h2 v-text="'Entrevistas'" />
    <VBtn
      v-if="can('crear entrevistas', 'Entrevista') && !props.bloqueada"
      class="ms-auto"
      color="success"
      @click="agendar"
    >
      <VIcon class="me-2 ri-add-large-fill" />
      Agendar entrevista
    </VBtn>
  </div>

  <VAlert
    v-if="props.bloqueada"
    type="info"
    variant="tonal"
    class="mb-4"
    text="La postulación está cerrada"
  />

  <DataTableComponent
    ref="dataTableRef"
    :columnas="headers"
    endpoint="api/entrevistas"
    :relaciones="['tipoEntrevista', 'resultadoEntrevista', 'entrevistador']"
    :filtros="filtros"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['reiniciar']"
  >
    <template #item.fecha_hora="{ item }">
      <span v-text="formatearFechaHora(item.fecha_hora)" />
    </template>

    <template #item.tipo="{ item }">
      <span v-text="item.tipo_entrevista?.nombre" />
    </template>

    <template #item.entrevistador="{ item }">
      <span v-text="`${item.entrevistador?.primer_nombre} ${item.entrevistador?.primer_apellido}`" />
    </template>

    <template #item.resultado="{ item }">
      <VChip
        :color="colorResultado(item.resultado_entrevista?.nombre)"
        size="small"
        v-text="item.resultado_entrevista?.nombre"
      />
    </template>

    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('editar entrevistas', 'Entrevista') && !props.bloqueada"
        icon="ri-edit-box-line"
        variant="tonal"
        color="warning"
        @click="editar(item)"
      />
    </template>
  </DataTableComponent>

  <VDialog
    v-model="mostrarDialogo"
    max-width="800"
  >
    <VCard :title="entrevistaEditar ? 'Editar entrevista' : 'Agendar entrevista'">
      <VCardText>
        <Fields
          v-if="mostrarDialogo"
          :key="entrevistaEditar?.id ?? 'nueva'"
          :item="entrevistaEditar"
          :postulacion-id="props.postulacionId"
          @emitir-datos="guardarEntrevista"
          @cancelar="mostrarDialogo = false"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
