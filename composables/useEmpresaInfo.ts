/**
 * Datos de la empresa — fuente única de verdad para encabezados, impresiones y PDFs.
 * Se configuran por .env (NUXT_PUBLIC_EMPRESA_*), ver nuxt.config.ts → runtimeConfig.public.empresa.
 */
export interface EmpresaInfo {
  nombre: string
  direccion: string
  telefono: string
  color: string
  colorClaro: string
  logo: string
}

export function useEmpresaInfo(): EmpresaInfo {
  return useRuntimeConfig().public.empresa as EmpresaInfo
}
