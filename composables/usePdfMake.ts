// ── Colores y utilidades compartidas ─────────────────────────────────────────
export const PDF_PRIMARIO       = '#666CFF'
export const PDF_PRIMARIO_BG    = '#F0F0FF'
export const PDF_PRIMARIO_BORDE = '#D9DAFF'
export const PDF_GRIS        = '#555555'
export const PDF_GRIS_CLARO  = '#f5f5f5'

export const pdfFmtFecha = (d: string | null | undefined): string => {
  if (!d) return '—'
  return d.substring(0, 10).split('-').reverse().join('/')
}

export const pdfLineaPrimaria = (ancho = 523) => ({
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: ancho, y2: 0, lineWidth: 3, lineColor: PDF_PRIMARIO }],
  margin: [0, 6, 0, 8],
})

export const pdfEstilosBase = {
  thPrimario:  { bold: true, fontSize: 9,  color: '#ffffff' },
  label:    { fontSize: 7.5, bold: true, color: PDF_PRIMARIO, characterSpacing: 0.3 },
  titulo:   { fontSize: 14, bold: true, color: PDF_PRIMARIO },
  seccion:  { fontSize: 9,  bold: true, color: PDF_PRIMARIO, characterSpacing: 0.5 },
  pie:      { fontSize: 7.5, color: '#999999' },
}

// ── Cabecera de empresa reutilizable ─────────────────────────────────────────────
export const pdfCabeceraEmpresa = (cli: any, tituloDoc: string, infoExtra?: string) => [
  {
    columns: [
      cli.logo?.startsWith('data:')
        ? { image: cli.logo, width: 52, height: 52 }
        : { text: '■', fontSize: 34, color: PDF_PRIMARIO, width: 52, margin: [0, 4, 0, 0] },
      {
        stack: [
          { text: cli.nombre,    fontSize: 14, bold: true, color: PDF_PRIMARIO },
          ...(cli.direccion ? [{ text: `Dir. ${cli.direccion}`, fontSize: 8.5, color: PDF_GRIS, margin: [0, 2, 0, 0] }] : []),
          ...(cli.telefono ? [{ text: `Tel. ${cli.telefono}`, fontSize: 8.5, color: PDF_GRIS, margin: [0, 1, 0, 0] }] : []),
        ],
        margin: [10, 4, 0, 0],
      },
      {
        stack: [
          { text: tituloDoc, fontSize: 11, bold: true, color: PDF_PRIMARIO, alignment: 'right' },
          ...(infoExtra ? [{ text: infoExtra, fontSize: 8.5, color: PDF_GRIS, alignment: 'right', margin: [0, 3, 0, 0] }] : []),
        ],
        width: 150,
        margin: [0, 4, 0, 0],
      },
    ],
    columnGap: 8,
  },
  pdfLineaPrimaria(),
]

// ── Pie de página ─────────────────────────────────────────────────────────────
export const pdfPie = (cli: any, docInfo: string) =>
  (currentPage: number, pageCount: number) => ({
    columns: [
      { text: `${cli.nombre} · ${cli.direccion}`, style: 'pie', margin: [36, 0, 0, 0] },
      { text: `${docInfo} · Pág. ${currentPage}/${pageCount}`, style: 'pie', alignment: 'right', margin: [0, 0, 36, 0] },
    ],
    margin: [0, 8],
  })

// ── Celda de tabla con borde izquierdo de color ───────────────────────────────
export const pdfBandaColor = (contenido: any, fillColor = PDF_PRIMARIO_BG, borderColor = PDF_PRIMARIO) => ({
  table: {
    widths: ['*'],
    body: [[{ ...contenido, fillColor, border: [true, false, false, false] }]],
  },
  layout: {
    hLineWidth: () => 0,
    vLineWidth: (i: number) => (i === 0 ? 3 : 0),
    vLineColor: () => borderColor,
  },
  margin: [0, 0, 0, 6],
})

// ── Composable principal ──────────────────────────────────────────────────────
export const usePdfMake = () => {
  const generando = ref(false)

  const descargarPdf = async (docDefinition: any, nombreArchivo: string) => {
    if (import.meta.server) return
    generando.value = true
    try {
      const { $pdfMake } = useNuxtApp()
      if (!$pdfMake) throw new Error('pdfmake no está disponible')
      ;($pdfMake as any).createPdf(docDefinition).download(`${nombreArchivo}.pdf`)
    }
    catch (e) { console.error('Error generando PDF:', e) }
    finally { generando.value = false }
  }

  return { descargarPdf, generando }
}
