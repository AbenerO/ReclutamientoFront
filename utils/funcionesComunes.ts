// Funciones comunes del proyecto (Nuxt las auto-importa, no hace falta import)

// Muestra la fecha como dd/mm/aaaa (se corta el texto para evitar desfases de zona horaria)
export const formatearFecha = (fecha: string | null | undefined) => {
  if (!fecha)
    return '—'

  const [anio, mes, dia] = fecha.substring(0, 10).split('-')

  return `${dia}/${mes}/${anio}`
}

// Muestra el monto como Q 6,000.00
export const formatearQuetzales = (monto: number | string | null | undefined) => {
  if (monto === null || monto === undefined || monto === '')
    return '—'

  return `Q ${Number(monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
