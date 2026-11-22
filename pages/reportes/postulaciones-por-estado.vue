<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({
  middleware: 'permissions',
  action: 'ver reporte postulaciones',
  subject: 'ReportePostulacion',
})

const { get } = useClienteRequest()

const { showToastError } = useToast()

const estados = ref<any[]>([])
const filas = ref<any[]>([])
const cargando = ref(true)

const cargarReporte = async () => {
  try {
    const respuesta = await get('api/reportes/postulaciones-por-estado')

    estados.value = respuesta.data.estados
    filas.value = respuesta.data.filas
  }
  catch (error: any) {
    showToastError(error.message)
  }
  finally {
    cargando.value = false
  }
}

const exportarExcel = () => {
  const filasExcel = filas.value.map((fila) => {
    const registro: Record<string, any> = { Vacante: fila.vacante }

    estados.value.forEach((estado) => {
      registro[estado.nombre] = fila.estados[estado.id]
    })

    registro.Total = fila.total

    return registro
  })

  const hoja = XLSX.utils.json_to_sheet(filasExcel)
  const libro = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(libro, hoja, 'Postulaciones por estado')
  XLSX.writeFile(libro, 'postulaciones-por-estado.xlsx')
}

cargarReporte()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Postulaciones por estado'" />
    <VBtn
      class="ms-auto"
      color="success"
      :disabled="cargando || !filas.length"
      @click="exportarExcel"
    >
      <VIcon class="me-2 ri-file-excel-2-line" />
      Exportar a Excel
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <VProgressLinear
        v-if="cargando"
        indeterminate
      />

      <VTable v-else>
        <thead>
          <tr>
            <th>Vacante</th>
            <th
              v-for="estado in estados"
              :key="estado.id"
              class="text-center"
            >
              {{ estado.nombre }}
            </th>
            <th class="text-center">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="fila in filas"
            :key="fila.vacante_id"
          >
            <td>{{ fila.vacante }}</td>
            <td
              v-for="estado in estados"
              :key="estado.id"
              class="text-center"
            >
              {{ fila.estados[estado.id] }}
            </td>
            <td class="text-center font-weight-bold">
              {{ fila.total }}
            </td>
          </tr>
          <tr v-if="!filas.length">
            <td
              :colspan="estados.length + 2"
              class="text-center"
            >
              No hay vacantes registradas
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>
