import Swal from 'sweetalert2'

export const useToast = () => {
  const nuxtApp = useNuxtApp()

  const getToast = () => {
    if (!import.meta.client) return null
    return (nuxtApp as any).$toast ?? null
  }

  const showToastSuccess = (message: string) => {
    getToast()?.success(message)
  }

  const showToastError = (message: string) => {
    getToast()?.error(message)
  }

  const showToastWarning = (message: string) => {
    getToast()?.warning(message)
  }

  const showToastInfo = (message: string) => {
    getToast()?.info(message)
  }

  const preguntaEliminar = async (mensaje: string, texto?: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: texto ?? mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    return result.isConfirmed
  }

  return { showToastSuccess, showToastError, showToastWarning, showToastInfo, preguntaEliminar }
}
