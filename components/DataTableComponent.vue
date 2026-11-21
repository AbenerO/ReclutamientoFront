<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { exportarDataFormatoCSV, exportarDataFormatoXLSX } from '@/utils/dataTable/exports'

// =======================================
// Interfaces
// =======================================
interface Columna {
  title: string
  key: string
}

interface DataTableProps {
  endpoint: string
  columnas: Columna[]
  cantidadPorPagina?: number
  cantidadPorPaginaOpciones?: number[]
  botones?: string[]
  titulo?: string
  filtros?: Record<string, any>
  relaciones?: string[]
  nombreArchivoExport?: string
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}

interface QueryParams {
  'page[number]'?: number
  'page[size]'?: number
  sort?: string
  include?: string
  [key: string]: string | number | undefined
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  current_page?: number
  last_page?: number
  per_page?: number
}

// =======================================
// Props y utilidades
// =======================================
const props = defineProps<DataTableProps>()
const { get } = useClienteRequest()

const cantidadPorPaginaValorDefault: number[] = [10, 20, 30]
const botonesDefault: string[] = ['xlsx', 'pdf', 'csv', 'reiniciar']
const fecha = new Date()

const {
  columnas,
  endpoint,
  cantidadPorPagina = 10,
  cantidadPorPaginaOpciones = cantidadPorPaginaValorDefault,
  botones = botonesDefault,
  relaciones,
  titulo = '',
  nombreArchivoExport = `reporte_data_${fecha.getTime()}`,
  mobileBreakpoint = 'sm',
} = props

// Asegurar que los filtros sean siempre reactivos
const filtros = ref(props.filtros ?? {})

// mobile-breakpoint no funciona pasado directo a VDataTableServer: el prop
// `mobile` (default false) que viaja junto con él pisa el cálculo interno.
const { thresholds, width } = useDisplay()
const isMobileTable = computed(() => width.value < thresholds.value[mobileBreakpoint])

// =======================================
// Estado reactivo
// =======================================
const items = ref<any[]>([])
const currentPage = ref<number>(1)
const totalItems = ref<number>(0)
const loading = ref<boolean>(false)
const search = ref<string>('')
const itemsByPage = ref<number>(cantidadPorPagina)
const itemsByPageOptions = ref<number[]>(cantidadPorPaginaOpciones)

const orden = ref<Array<{ key: string; order: 'asc' | 'desc' }>>([])

// =======================================
// Funciones auxiliares
// =======================================

/**
 * Construye una URL con parámetros de consulta.
 */
function buildUrlWithQuery(base: string, params: QueryParams): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '')
      searchParams.append(key, String(value))
  })

  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}${searchParams.toString()}`
}

/**
 * Obtiene los datos del endpoint con paginación y filtros.
 */
async function getItems(): Promise<void> {
  const sortParam = orden.value.length
    ? orden.value[0].order === 'asc'
      ? orden.value[0].key
      : `-${orden.value[0].key}`
    : ''

  const data: QueryParams = {
    'page[number]': currentPage.value,
    'page[size]': itemsByPage.value,
    'sort': sortParam,
    'include': relaciones?.join(','),
  }

  if (filtros.value && typeof filtros.value === 'object') {
    Object.keys(filtros.value).forEach(key => {
      data[`filter[${key}]`] = filtros.value[key]
    })
  }

  try {
    loading.value = true

    const urlWithParams = buildUrlWithQuery(endpoint, {
      ...data,
      search: search.value,
    })

    const respuesta = await get<PaginatedResponse<any>>(urlWithParams)
    const paginated = (respuesta as any)?.data ?? respuesta

    items.value = paginated.data ?? []
    totalItems.value = paginated.total ?? 0
  }
  catch (error: any) {
    console.error('Error en getItems:', error)
  }
  finally {
    loading.value = false
  }
}

/**
 * Reinicia la tabla a su estado inicial.
 */
async function reiniciar(): Promise<void> {
  currentPage.value = 1
  itemsByPage.value = cantidadPorPagina
  filtros.value = {}

  orden.value = []

  await getItems()
}

/**
 * Exporta los datos en formato CSV.
 */
function exportCSV(): void {
  try {
    exportarDataFormatoCSV(items.value, nombreArchivoExport, columnas as any)
  }
  catch (error) {
    console.error('Error al exportar CSV:', error)
  }
}

/**
 * Exporta los datos en formato XLSX.
 */
function exportXLSX(): void {
  try {
    exportarDataFormatoXLSX(items.value, nombreArchivoExport, columnas as any)
  }
  catch (error) {
    console.error('Error al exportar XLSX:', error)
  }
}

// =======================================
// Ciclo de vida y observadores
// =======================================
onMounted(() => {
  getItems()
})

watch([currentPage, itemsByPage, filtros], getItems, { deep: true })

// Sincronizar cuando el padre cambia los filtros desde afuera
watch(() => props.filtros, (newVal) => {
  filtros.value = { ...(newVal ?? {}) }
  currentPage.value = 1
}, { deep: true })

defineExpose({ getItems })
</script>

<template>
  <VCard :title="titulo">
    <VCardText>
      <VContainer fluid>
        <VRow
          justify="end"
          class="mb-0 flex-wrap"
        >
          <VMenu>
            <template #activator="{ props }">
              <VBtn
                color="primary"
                v-bind="props"
              >
                <VIcon class="ri-upload-2-fill" />
                Exportar
              </VBtn>
            </template>

            <VList
              dense
              class="pa-1 ma-1"
            >
              <VBtn
                v-if="botones.includes('csv')"
                class="mb-1"
                variant="tonal"
                block
                @click="exportCSV"
              >
                <VIcon class="ri-file-text-line" />
                <span>CSV</span>
              </VBtn>

              <VBtn
                v-if="botones.includes('xlsx')"
                class="mb-1"
                variant="tonal"
                block
                @click="exportXLSX"
              >
                <VIcon class="ri-file-excel-2-line" />
                <span>Excel</span>
              </VBtn>
            </VList>
          </VMenu>

          <VBtn
            v-if="botones.includes('reiniciar')"
            class="mb-3 ml-2"
            variant="tonal"
            @click="reiniciar"
          >
            <VTooltip
              activator="parent"
              location="top"
              start
            >
              <span>Reiniciar</span>
            </VTooltip>
            <VIcon class="ri-loop-left-fill" />
            Recargar
          </VBtn>
        </VRow>
      </VContainer>

      <VRow>
        <VDataTableServer
          v-model:items-per-page="itemsByPage"
          v-model:page="currentPage"
          v-model:sort-by="orden"
          :headers="columnas"
          :items="items"
          :items-length="totalItems"
          :items-per-page-options="itemsByPageOptions"
          :loading="loading"
          :search="search"
          :mobile="isMobileTable"
          item-value="id"
          @update:sort-by="getItems"
          @update:search="getItems"
        >
          <!-- Slots dinámicos para columnas personalizadas -->
          <template
            v-for="name in Object.keys($slots)"
            :key="name"
            #[name]="slotProps"
          >
            <slot
              :name="name"
              v-bind="slotProps"
            />
          </template>

          <!-- Slot que se muestra cuando no hay registros -->
          <template #no-data>
            <div class="text-center py-6 text-grey">
              <VIcon
                class="mb-2 ri-database-2-line"
                size="28"
              />
              <div>No hay datos disponibles</div>
            </div>
          </template>
        </VDataTableServer>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
/* Estilos personalizados */
</style>
