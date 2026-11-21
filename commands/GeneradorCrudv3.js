/**
 * GeneradorCrudv3.js
 *
 * Lee el JSON generado por `php artisan make:api` desde el portapapeles
 * y genera los archivos CRUD completos del frontend.
 *
 * Uso:
 *   1. Ejecutar `php artisan make:api {tabla} {Modelo}` en BackClinic
 *   2. El backend copia el JSON automáticamente al portapapeles
 *   3. Ejecutar `npm run generarCrudV3` en FrontClinic
 */

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

const ask = q => new Promise(resolve => rl.question(q, resolve))

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
  campos
    .map(
      campo => `
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
        `,
    )
    .join('')

const formatoShowInputs = campos =>
  campos
    .map(
      campo => `
              <VListItemTitle>
                <h6 class="text-h6">
                    ${formatearCampoLabel(campo)}:
                  <div class="d-inline-block text-capitalize text-body-1">
                    {{ item.${campo} }}
                  </div>
                </h6>
              </VListItemTitle>
            `,
    )
    .join('')

function pluralizar(palabra) {
  if (!palabra) return ''
  const vocales = ['a', 'e', 'i', 'o', 'u']
  const ultima = palabra.slice(-1).toLowerCase()
  const penultima = palabra.slice(-2, -1).toLowerCase()
  if (vocales.includes(ultima)) return `${palabra}s`
  if (ultima === 'z') return `${palabra.slice(0, -1)}ces`
  if (ultima === 'n' || ultima === 'r') return `${palabra}es`
  if (ultima === 'l' && penultima === 'e') return `${palabra}es`
  return `${palabra}es`
}

// PascalCase → camelCase  (ej: "TipoSangre" → "tipoSangre")
const toCamelCase = str => str.charAt(0).toLowerCase() + str.slice(1)

// ── Explorador recursivo de carpetas ─────────────────────────────────────────

async function directoriosEn(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}

async function pickPath(base, partes = []) {
  const actual = path.join(base, ...partes)
  const sub = await directoriosEn(actual)

  if (sub.length === 0) return partes

  const ruta = partes.length ? partes.join('/') : '(raíz)'
  console.log(chalk.greenBright(`\n  Carpetas en pages/${ruta}:`))
  sub.forEach((d, i) => console.log(chalk.magenta(`  ${i + 1}. ${d}`)))
  console.log(chalk.gray('  0. (quedarse aquí)'))

  const ans = await ask(chalk.cyanBright('\n  Selecciona carpeta (Enter = aquí): '))

  if (ans === '' || ans === '0') return partes

  const n = Number(ans)
  const dir = !Number.isNaN(n) && n >= 1 && n <= sub.length ? sub[n - 1] : ans

  return pickPath(base, [...partes, dir])
}

// ── Crear directorio con corrección de case en Windows ───────────────────────

function crearDirectorio(dir) {
  const dirAbs = path.resolve(dir)
  const parent = path.dirname(dirAbs)
  const nombreCorrecto = path.basename(dirAbs)

  if (fs.existsSync(parent)) {
    const existente = fs.readdirSync(parent).find(
      n => n.toLowerCase() === nombreCorrecto.toLowerCase(),
    )
    if (existente && existente !== nombreCorrecto) {
      const temp = path.join(parent, `__tmp_${Date.now()}__`)
      fs.renameSync(path.join(parent, existente), temp)
      fs.renameSync(temp, dirAbs)
      console.log(
        `  ${chalk.yellow('⚠')} Renombrado: ${chalk.red(existente)} → ${chalk.green(nombreCorrecto)}`,
      )
      return
    }
  }

  if (!fs.existsSync(dirAbs)) fs.mkdirSync(dirAbs, { recursive: true })
}

// ── Leer plantilla y aplicar reemplazos ──────────────────────────────────────

function leerPlantilla(carpeta, archivo, reemplazos) {
  const filePath = path.join(__dirname, 'PlantillasCrud', carpeta, archivo)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Plantilla no encontrada: ${filePath}`)
  }

  let contenido = fs.readFileSync(filePath, 'utf-8')
  for (const [clave, valor] of Object.entries(reemplazos))
    contenido = contenido.replace(new RegExp(`\\{\\{ ${clave} \\}\\}`, 'g'), valor)

  return contenido
}

// ── Flujo principal ───────────────────────────────────────────────────────────

async function main() {
  try {
    // 1. Leer JSON del portapapeles
    let raw = ''
    try {
      raw = clipboardy.readSync()
    }
    catch {
      throw new Error('No se pudo leer el portapapeles.')
    }

    raw = raw.replace(/\0/g, '').trim()

    let datosJSON
    try {
      datosJSON = JSON.parse(raw)
    }
    catch {
      throw new Error(
        'El portapapeles no contiene JSON válido.\n'
        + '  Asegúrate de haber ejecutado: php artisan make:api {tabla} {Modelo}',
      )
    }

    const sep = chalk.hex('#1E293B')('─'.repeat(54))

    console.log(`\n  ${sep}`)
    console.log(`  ${chalk.hex('#A78BFA').bold('🔧 GeneradorCrudV3')}  ${chalk.hex('#94A3B8')('(lee JSON del portapapeles)')}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#6EE7B7')('Modelo:')}      ${chalk.bold(datosJSON.Modelo)}`)
    console.log(`  ${chalk.hex('#6EE7B7')('Ruta API:')}    ${chalk.hex('#38BDF8')(datosJSON.Ruta)}`)
    console.log(`  ${chalk.hex('#6EE7B7')('Permisos:')}    ${chalk.hex('#F9A8D4')(datosJSON.modeloSeparado)}`)
    console.log(`  ${sep}\n`)

    const modelo = datosJSON.Modelo
    const url = datosJSON.Ruta
    const modeloSeparado = datosJSON.modeloSeparado
    const campos = Object.keys(datosJSON.columnas).filter(Boolean)

    // 2. Selección recursiva de carpeta en pages/
    const pagesDir = path.join(__dirname, 'pages')
    if (!fs.existsSync(pagesDir)) {
      throw new Error('No se encontró el directorio /pages.')
    }

    const segmentos = await pickPath(pagesDir)
    const subCarpeta = segmentos.join('/')

    const rutaFinalLabel = subCarpeta ? `pages/${subCarpeta}` : 'pages'
    console.log(chalk.cyanBright(`\n  📂 Destino seleccionado: ${rutaFinalLabel}/`))

    const confirmacion = await ask(chalk.yellow('  ¿Crear CRUD aquí? (y/N): '))
    if (!confirmacion.toLowerCase().startsWith('y')) {
      console.log(chalk.red('\n  Operación cancelada.\n'))
      return
    }

    // 3. Calcular rutas
    const modelPlural = pluralizar(toCamelCase(modelo))

    const dirPages = subCarpeta
      ? `./pages/${subCarpeta}/${modelPlural}`
      : `./pages/${modelPlural}`

    const dirViews = subCarpeta
      ? `./views/pages/${subCarpeta}/${modelPlural}`
      : `./views/pages/${modelPlural}`

    const dirTypes = subCarpeta
      ? `./types/${subCarpeta}/${modelPlural}`
      : `./types/${modelPlural}`

    // Para imports en los templates
    const viewsAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural
    const typesAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural

    // navActiveLink: ej. "configuracion-categorias"
    const navActiveLink = subCarpeta
      ? `${subCarpeta.replace(/\//g, '-')}-${modelPlural}`
      : modelPlural

    // directory alias (ruta sin "pages/", usado en to="/.../create")
    const directoryAlias = subCarpeta ? `${subCarpeta}/${modelPlural}` : modelPlural

    // 4. Crear directorios
    ;[dirPages, dirViews, dirTypes].forEach(crearDirectorio)

    // 5. Preparar datos comunes
    const columnasJSON = JSON.stringify(
      formatearCamposTable([...campos, 'Acciones']),
      null,
      2,
    )
    const camposFormCreate = formatoCamposFormCreate(campos)
    const inputsFormulario = formatoHtmlInputsFormulario(campos)

    const reemplazosBase = {
      model: modelo,
      modelPlural,
      modeloSeparado,
      navActiveLink,
      url,
      directory: directoryAlias,
      viewsAlias,
      typesAlias,
      camposFormCreate,
    }

    // 6. Generar archivos desde plantillas
    const listTemplate = leerPlantilla('Pages', 'index.vue', {
      ...reemplazosBase,
      headers: columnasJSON,
    })
    const createTemplate = leerPlantilla('Pages', 'create.vue', reemplazosBase)
    const editTemplate = leerPlantilla('Pages', 'edit.vue', reemplazosBase)
    const showTemplate = leerPlantilla('Pages', 'show.vue', {
      ...reemplazosBase,
      fields: columnasJSON,
      camposForm: formatoShowInputs(campos),
    })
    const viewFields = leerPlantilla('Views', 'fields.vue', {
      ...reemplazosBase,
      inputsFormulario,
    })

    // La interfaz TypeScript usa los tipos ya formateados del backend
    const fieldsInterfaz = datosJSON.columnastypes
      || campos.map(c => `  ${c}: string;`).join('\n')

    const interfazTemplate = leerPlantilla('Types', 'index.ts', {
      model: modelo,
      fieldsInterfaz,
    })

    // 7. Escribir archivos
    fs.writeFileSync(path.join(dirPages, 'index.vue'), listTemplate)
    fs.writeFileSync(path.join(dirPages, 'create.vue'), createTemplate)
    fs.writeFileSync(path.join(dirViews, 'fields.vue'), viewFields)
    fs.writeFileSync(path.join(dirTypes, 'index.ts'), interfazTemplate)

    const editDir = path.join(dirPages, 'edit')
    crearDirectorio(editDir)
    fs.writeFileSync(path.join(path.resolve(editDir), '[id].vue'), editTemplate)

    const showDir = path.join(dirPages, 'show')
    crearDirectorio(showDir)
    fs.writeFileSync(path.join(path.resolve(showDir), '[id].vue'), showTemplate)

    // 8. Resumen
    console.log(chalk.hex('#34D399').bold('\n  ✅ Archivos generados correctamente\n'))

    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#A78BFA').bold('📂 Páginas')}   ${chalk.hex('#475569')(dirPages)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#E2E8F0')('index.vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#F9A8D4')('create.vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  ├──')} ${chalk.hex('#FCD34D')('edit/[id].vue')}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#86EFAC')('show/[id].vue')}`)

    console.log(`\n  ${sep}`)
    console.log(`  ${chalk.hex('#F472B6').bold('📂 Types')}     ${chalk.hex('#475569')(dirTypes)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#E2E8F0')('index.ts')}`)

    console.log(`\n  ${sep}`)
    console.log(`  ${chalk.hex('#FB923C').bold('📂 Views')}     ${chalk.hex('#475569')(dirViews)}`)
    console.log(`  ${sep}`)
    console.log(`  ${chalk.hex('#38BDF8')('  └──')} ${chalk.hex('#E2E8F0')('fields.vue')}`)

    console.log(`\n  ${chalk.hex('#94A3B8')('💡 Recuerda:')}`)
    console.log(`  ${chalk.hex('#64748B')('  - Mover rutas de api.php al sub-archivo correcto')}`)
    console.log(`  ${chalk.hex('#64748B')('  - Agregar middleware auth:sanctum')}`)
    console.log(`  ${chalk.hex('#64748B')('  - Descomentar definePageMeta en las páginas generadas')}`)

    console.log(`\n  ${chalk.hex('#34D399').bold('🚀 ¡CRUD generado con éxito!')}\n`)
  }
  catch (error) {
    console.error(
      `\n  ${chalk.hex('#F87171').bold('✖ Error:')} ${chalk.hex('#FCA5A5')(error.message)}\n`,
    )
  }
  finally {
    rl.close()
  }
}

main()