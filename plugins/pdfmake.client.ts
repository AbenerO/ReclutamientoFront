export default defineNuxtPlugin(async () => {
  try {
    const pdfMake   = (await import('pdfmake/build/pdfmake')).default
    const vfsFonts  = await import('pdfmake/build/vfs_fonts')
    pdfMake.vfs     = (vfsFonts as any).default ?? vfsFonts

    return { provide: { pdfMake } }
  }
  catch (e) {
    console.warn('pdfmake no se pudo cargar:', e)
    return { provide: { pdfMake: null } }
  }
})
