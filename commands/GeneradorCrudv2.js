import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import chalk from 'chalk'
import clipboardy from 'clipboardy'

const __dirname = path.resolve()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = query => new Promise(resolve => rl.question(query, resolve))

// ── Helpers de formato ────────────────────────────────────────────────────────

const formatearCampoLabel = str =>
  str
    .split('_')
    .filter(word => word.toLowerCase() !== 'id')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatearCamposTable = campos =>
  campos.map(campo => ({ title: formatearCampoLabel(campo), value: campo }))

const formatoCamposFormCreate = campos => {
  const state = {}

  campos.forEach(campo => (state[campo] = null))

  return `{ ${Object.entries(state).map(([k, v]) => `${k}: ${v}`).join(',\n')} }`
}

const formatoHtmlInputsFormulario = campos =>
  campos.map(campo => `
            <VCol cols="12" md="6">
                <VTextField
                    :id="useId()"
                    v-model="data.${campo}"
                    :rules="[requiredValidator]"
                    label="${formatearCampoLabel(campo)}"
                    placeholder="Ingrese ${formatearCampoLabel(campo)}"
                    required
                />
            </VCol>
        `).join('')

const formatoCamposInterfaz = campos =>
  campos.map(campo => `\n        ${campo}: string;`).join('')

const formatoShowInputs = campos =>
  campos.map(campo => `
              <VListItemTitle>
                <h6 class="text-h6">
                    ${formatearCampoLabel(campo)}:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.${campo} }}
                  </div>
                </h6>
              </VListItemTitle>
            `).join('')

function pluralizar(palabra) {
  if (!palabra)
    return ''
  const vocales = ['a', 'e', 'i', 'o', 'u']
  const ultima = palabra.slice(-1).toLowerCase()
  const penultima = palabra.slice(-2, -1).toLowerCase()
  if (vocales.includes(ultima))
    return `${palabra}s`
  if (ultima === 'z')
    return `${palabra.slice(0, -1)}ces`
  if (ultima === 'n' || ultima === 'r')
    return `${palabra}es`
  if (ultima === 'l' && penultima === 'e')
    return `${palabra}es`

  return `${palabra}es`
}

// Convierte PascalCase → camelCase  (ej: "TipoSangre" → "tipoSangre")
const toCamelCase = str =>
  str.charAt(0).toLowerCase() + str.slice(1)

// ── Selección interactiva de carpeta ─────────────────────────────────────────

const listarCarpetas = dirBase => {
  if (!fs.existsSync(dirBase))
    return []

  return fs.readdirSync(dirBase, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}

const seleccionarCarpeta = async (dirBase, porDefecto) => {
  const carpetas = listarCarpetas(dirBase)
  const linea = chalk.hex('#1E293B')('─'.repeat(52))

  console.log(`\n  ${linea}`)
  console.log(`  ${chalk.hex('#A78BFA').bold('📁 Carpeta destino')}  ${chalk.hex('#38BDF8').bold(dirBase)}`)
  console.log(`  ${linea}`)
  console.log(`  ${chalk.hex('#6EE7B7')('[0]')}  ${chalk.hex('#475569')(`${dirBase}/`)}  ${chalk.hex('#475569').italic('(raíz)')}`)

  carpetas.forEach((carpeta, i) => {
    const num = chalk.hex('#6EE7B7')(`[${i + 1}]`)
    const base = chalk.hex('#64748B')(`${dirBase}/`)
    const nombre = chalk.hex('#F9A8D4').bold(carpeta)

    console.log(`  ${num}  ${base}${nombre}`)
  })

  console.log(`  ${linea}`)

  const input = await question(`  ${chalk.hex('#FCD34D')('❯')} ${chalk.hex('#E2E8F0')('Elige una opción')} ${chalk.hex('#475569')('(Enter = raíz):')}  `)
  const opcion = Number.parseInt(input.trim())

  if (isNaN(opcion) || opcion === 0)
    return porDefecto
  if (opcion >= 1 && opcion <= carpetas.length)
    return `${porDefecto}/${carpetas[opcion - 1]}`

  console.log(`  ${chalk.hex('#F87171')('✖')} ${chalk.hex('#FCA5A5')('Opción no válida, se usará la raíz.')}`)

  return porDefecto
}

// ── Leer plantilla y aplicar reemplazos ──────────────────────────────────────

const leerPlantilla = (carpeta, archivo, reemplazos) => {
  let contenido = fs.readFileSync(path.join(__dirname, 'PlantillasCrud', carpeta, archivo), 'utf-8')
  for (const [clave, valor] of Object.entries(reemplazos))
    contenido = contenido.replace(new RegExp(`{{ ${clave} }}`, 'g'), valor)

  return contenido
}

// ── Flujo principal ───────────────────────────────────────────────────────────

const askQuestions = async () => {
  try {
    const urlBackend = clipboardy.readSync()

    console.log(`\n  ${chalk.hex('#94A3B8')('🔗 URL del portapapeles:')} ${chalk.hex('#38BDF8')(urlBackend)}`)

    if (!urlBackend)
      throw new Error('El portapapeles está vacío o no contiene una URL válida.')

    const response = await fetch(urlBackend)
    if (!response.ok)
      throw new Error(`Error al obtener los datos: ${response.status} ${response.statusText}`)

    const { data } = await response.json()
    const modelo = data.nombreDelModelo
    const url = data.ruta
    const campos = data.columns.map(c => c.trim()).filter(Boolean)

    // ── Selección de carpeta padre en pages/ ─────────────────────────────────
    const rutaBase = await seleccionarCarpeta('./pages', 'pages')
    const subCarpeta = rutaBase.replace(/^pages\/?/, '')

    const rutaTypes = subCarpeta ? `types/${subCarpeta}` : 'types'
    const rutaViews = subCarpeta ? `views/pages/${subCarpeta}` : 'views/pages'

    const tick = chalk.hex('#34D399')('✔')

    console.log(`\n  ${tick}  ${chalk.hex('#94A3B8')('types  →')}  ${chalk.hex('#7DD3FC').bold(`./${rutaTypes}`)}`)
    console.log(`  ${tick}  ${chalk.hex('#94A3B8')('views  →')}  ${chalk.hex('#7DD3FC').bold(`./${rutaViews}`)}\n`)

    // ── Calcular rutas finales ────────────────────────────────────────────────
    const modelPlural = pluralizar(toCamelCase(modelo))
    const directory = `./${rutaBase}/${modelPlural}`
    const directoryTypes = `./${rutaTypes}/${modelPlural}`
    const directoryViews = `./${rutaViews}/${modelPlural}`

    const directoryAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural

    // Crear directorios (con fix de capitalización en Windows)
    const crearDirectorioConCase = (dir) => {
      const dirAbs = path.resolve(dir)
      const parent = path.dirname(dirAbs)
      const nombreCorrecto = path.basename(dirAbs)

      if (fs.existsSync(parent)) {
        const existente = fs.readdirSync(parent).find(
          n => n.toLowerCase() === nombreCorrecto.toLowerCase()
        )
        if (existente && existente !== nombreCorrecto) {
          // Renombrar con nombre temporal para forzar el cambio de case en Windows
          const temp = path.join(parent, `__tmp_${Date.now()}__`)
          fs.renameSync(path.join(parent, existente), temp)
          fs.renameSync(temp, dirAbs)
          console.log(`  ${chalk.hex('#FCD34D')('⚠')}  Renombrado: ${chalk.hex('#F87171')(existente)} → ${chalk.hex('#34D399').bold(nombreCorrecto)}`)
          return
        }
      }

      if (!fs.existsSync(dirAbs))
        fs.mkdirSync(dirAbs, { recursive: true })
    }

    ;[directory, directoryViews, directoryTypes].forEach(crearDirectorioConCase)

    // ── Preparar datos comunes ────────────────────────────────────────────────
    const columnasJSON = JSON.stringify(formatearCamposTable([...campos, 'Acciones']), null, 2)
    const camposFormCreate = formatoCamposFormCreate(campos)
    const inputsFormulario = formatoHtmlInputsFormulario(campos)

    // Alias para imports: incluyen la subcarpeta si existe
    const viewsAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural
    const typesAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural

    const reemplazosBase = { model: modelo, modelPlural, url, directory: directoryAlias, camposFormCreate, viewsAlias, typesAlias }

    // ── Generar plantillas ────────────────────────────────────────────────────
    const listTemplate = leerPlantilla('Pages', 'index.vue', { ...reemplazosBase, headers: columnasJSON })
    const createTemplate = leerPlantilla('Pages', 'create.vue', reemplazosBase)
    const editTemplate = leerPlantilla('Pages', 'edit.vue', reemplazosBase)
    const showTemplate = leerPlantilla('Pages', 'show.vue', { ...reemplazosBase, fields: columnasJSON, camposForm: formatoShowInputs(campos) })
    const viewFields = leerPlantilla('Views', 'fields.vue', { ...reemplazosBase, inputsFormulario })
    const interfazTemplate = leerPlantilla('Types', 'index.ts', { model: modelo, fieldsInterfaz: formatoCamposInterfaz(campos) })

    // ── Escribir archivos ─────────────────────────────────────────────────────
    fs.writeFileSync(path.join(directory, 'index.vue'), listTemplate)
    fs.writeFileSync(path.join(directory, 'create.vue'), createTemplate)
    fs.writeFileSync(path.join(directoryViews, 'fields.vue'), viewFields)
    fs.writeFileSync(path.join(directoryTypes, 'index.ts'), interfazTemplate)

    const editDir = path.join(directory, 'edit')
    crearDirectorioConCase(editDir)
    fs.writeFileSync(path.join(path.resolve(editDir), '[id].vue'), editTemplate)

    const showDir = path.join(directory, 'show')
    crearDirectorioConCase(showDir)
    fs.writeFileSync(path.join(path.resolve(showDir), '[id].vue'), showTemplate)

    // ── Resumen final ─────────────────────────────────────────────────────────
    const sep = chalk.hex('#1E293B')('─'.repeat(50))

    console.log(chalk.hex('#34D399').bold('\n  ✅ Archivos generados correctamente\n'))

    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#A78BFA').bold('📂 Páginas')}   ${chalk.hex('#475569')(directory)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#E2E8F0')('index.vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#F9A8D4')('create.vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#FCD34D')('edit/[id].vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#86EFAC')('show/[id].vue')}`)

    console.log(`\n  ${sep}`)
    console.log(`  ${chalk.hex('#F472B6').bold('📂 Types')}     ${chalk.hex('#475569')(directoryTypes)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#E2E8F0')('index.ts')}`)

    console.log(`\n  ${sep}`)
    console.log(`  ${chalk.hex('#FB923C').bold('📂 Views')}     ${chalk.hex('#475569')(directoryViews)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#E2E8F0')('fields.vue')}`)

    console.log(`\n  ${chalk.hex('#34D399').bold('🚀 ¡CRUD generado con éxito!')}\n`)
  }
  catch (error) {
    console.error(`\n  ${chalk.hex('#F87171').bold('✖ Error:')} ${chalk.hex('#FCA5A5')(error.message)}\n`)
  }
  finally {
    rl.close()
  }
}

askQuestions()
