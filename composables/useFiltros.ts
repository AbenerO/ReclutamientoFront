/**
 * useFiltros — composable para manejar filtros de DataTableComponent con debounce.
 *
 * Uso:
 *   const { form, filtros, limpiarFiltros } = useFiltros({ nombre: '', dpi: '' })
 *
 * - `form`   → bindear a los campos del formulario de filtros
 * - `filtros` → pasar al :filtros del DataTableComponent
 * - `limpiarFiltros()` → resetea ambos
 */
export function useFiltros<T extends Record<string, any>>(initialForm: T, debounceMs = 400) {
  const form = reactive<T>({ ...initialForm })
  const filtros = ref<Record<string, any>>({})

  let debTimer: ReturnType<typeof setTimeout>

  const aplicar = () => {
    const activos: Record<string, any> = {}
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '')
        activos[k] = v
    })
    filtros.value = activos
  }

  watch(form, () => {
    clearTimeout(debTimer)
    debTimer = setTimeout(aplicar, debounceMs)
  }, { deep: true })

  const limpiarFiltros = () => {
    Object.keys(form).forEach(k => ((form as any)[k] = (initialForm as any)[k] ?? ''))
    filtros.value = {}
  }

  return { form, filtros, limpiarFiltros, aplicar }
}
