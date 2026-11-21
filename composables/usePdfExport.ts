export const usePdfExport = () => {
  const generando = ref(false)

  const exportarPdf = async (
    elementId: string,
    nombreArchivo: string,
    opciones?: {
      orientacion?: 'portrait' | 'landscape'
      formato?: 'a4' | 'letter'
      margen?: number
    },
  ) => {
    if (import.meta.server) return

    generando.value = true
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const elemento = document.getElementById(elementId)
      if (!elemento) {
        console.error(`Elemento #${elementId} no encontrado`)
        return
      }

      const orientacion = opciones?.orientacion ?? 'portrait'
      const formato     = opciones?.formato     ?? 'a4'
      const margen      = opciones?.margen      ?? 10

      await html2pdf()
        .set({
          margin:       margen,
          filename:     `${nombreArchivo}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: formato, orientation: orientacion },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(elemento)
        .save()
    }
    catch (e) {
      console.error('Error generando PDF:', e)
    }
    finally {
      generando.value = false
    }
  }

  return { exportarPdf, generando }
}
