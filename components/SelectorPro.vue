<script setup lang="ts">
/**
 * SelectorPro — selector con búsqueda optimizado y reutilizable.
 *
 * Props:
 *   modelValue   — ID seleccionado (v-model)
 *   endpoint     — ruta API, ej: 'api/usuarios'
 *   include      — relaciones a cargar, ej: ['roles']
 *   labelFn      — función que recibe el item y devuelve el texto a mostrar
 *   label        — etiqueta del campo
 *   placeholder  — placeholder del campo
 *   rules        — reglas de validación de Vuetify
 *   required     — marca el campo como requerido
 *   clearable    — permite limpiar la selección
 *   perPage      — cuántos registros cargar (default 300)
 *   disabled     — deshabilita el campo
 *   extraParams  — parámetros adicionales para la URL, ej: { 'filter[estado]': 'activo' }
 *
 * Uso:
 *   <SelectorPro
 *     v-model="data.consulta_id"
 *     endpoint="api/usuarios"
 *     :include="['roles']"
 *     :label-fn="c => `Consulta #${c.id} — ${fmtDate(c.fecha_consulta)}`"
 *     label="Consulta"
 *     :rules="[requiredValidator]"
 *   />
 */

const props = withDefaults(defineProps<{
  modelValue?: number | null
  endpoint: string
  include?: string[]
  labelFn?: (item: any) => string
  label?: string
  placeholder?: string
  rules?: any[]
  required?: boolean
  clearable?: boolean
  perPage?: number
  disabled?: boolean
  extraParams?: Record<string, string | number>
}>(), {
  modelValue: null,
  include: () => [],
  labelFn: (i: any) => String(i.id),
  label: '',
  placeholder: 'Buscar...',
  rules: () => [],
  required: false,
  clearable: true,
  perPage: 300,
  disabled: false,
  extraParams: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void
  (e: 'change', item: any): void
}>()

const { get } = useClienteRequest()
const items = ref<any[]>([])
const cargando = ref(false)

// Items con _label precalculado para evitar recalcular en cada render
const itemsMapped = computed(() =>
  items.value.map(i => ({ ...i, _label: props.labelFn(i) })),
)

const cargar = async () => {
  cargando.value = true
  try {
    const params = new URLSearchParams()
    params.set('per_page', String(props.perPage))
    if (props.include.length)
      params.set('include', props.include.join(','))
    for (const [k, v] of Object.entries(props.extraParams))
      params.set(k, String(v))

    const res: any = await get(`${props.endpoint}?${params.toString()}`)
    items.value = res?.data?.data ?? res?.data ?? []
  }
  catch (e) {
    console.error('[SelectorPro] Error cargando datos de', props.endpoint, e)
  }
  finally {
    cargando.value = false
  }
}

onMounted(cargar)

const onSeleccionar = (id: number | null) => {
  emit('update:modelValue', id)
  if (id !== null) {
    const item = items.value.find(i => i.id === id)
    if (item)
      emit('change', item)
  }
}
</script>

<template>
  <VAutocomplete
    :id="useId()"
    :model-value="modelValue"
    :items="itemsMapped"
    item-title="_label"
    item-value="id"
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    :required="required"
    :clearable="clearable"
    :loading="cargando"
    :disabled="disabled"
    @update:model-value="onSeleccionar"
  />
</template>
