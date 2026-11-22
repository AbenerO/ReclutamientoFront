<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
const { nombre: nombreEmpresa } = useEmpresaInfo()

// Colores reactivos al tema (ApexCharts no entiende CSS vars)
const isDark    = computed(() => theme.global.current.value.dark)
const textColor = computed(() => isDark.value ? '#cfd8dc' : '#546e7a')

const client = useSanctumClient()

// ─── Estado ─────────────────────────────────────────────────────────────────
const loading = ref(true)
const kpis = ref({
  total_usuarios: 0,
  usuarios_activos: 0,
  total_roles: 0,
})
const usuariosPorRol = ref<{ nombre: string; total: number }[]>([])
const ultimosUsuarios = ref<any[]>([])

// ─── Carga de datos ──────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const respuesta: any = await client('api/dashboard/estadisticas')
    const data = respuesta.data
    kpis.value = data.kpis
    usuariosPorRol.value = data.usuarios_por_rol ?? []
    ultimosUsuarios.value = data.ultimos_usuarios ?? []
  }
  catch (e) {
    console.error('Error al cargar estadísticas del dashboard', e)
  }
  finally {
    loading.value = false
  }
})

// ─── KPI cards ───────────────────────────────────────────────────────────────
const kpiCards = computed(() => [
  { titulo: 'Usuarios', valor: kpis.value.total_usuarios, icono: 'ri-group-line', color: 'primary' },
  { titulo: 'Usuarios activos', valor: kpis.value.usuarios_activos, icono: 'ri-user-follow-line', color: 'success' },
  { titulo: 'Roles', valor: kpis.value.total_roles, icono: 'ri-shield-user-line', color: 'info' },
])

// ─── Gráfica: usuarios por rol ───────────────────────────────────────────────
const rolesSeries = computed(() => [{ name: 'Usuarios', data: usuariosPorRol.value.map(r => r.total) }])
const rolesOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '55%' } },
  dataLabels: { enabled: false },
  colors: [theme.current.value.colors.primary],
  grid: { strokeDashArray: 4, borderColor: isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' },
  xaxis: {
    categories: usuariosPorRol.value.map(r => r.nombre),
    labels: { style: { colors: textColor.value } },
  },
  yaxis: { labels: { style: { colors: textColor.value } } },
  tooltip: { theme: isDark.value ? 'dark' : 'light' },
}))
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">
        Bienvenido a {{ nombreEmpresa }}
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Resumen general del sistema.
      </p>
    </div>

    <!-- ── KPIs ──────────────────────────────────────────────────────────── -->
    <VRow class="mb-4">
      <VCol
        v-for="card in kpiCards"
        :key="card.titulo"
        cols="12"
        sm="6"
        md="4"
      >
        <VCard rounded="lg">
          <VCardText class="d-flex align-center gap-4 pa-5">
            <VAvatar size="52" :color="card.color" variant="tonal" rounded="lg">
              <VIcon :icon="card.icono" size="28" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-bold">
                <VProgressCircular v-if="loading" indeterminate size="20" width="2" :color="card.color" />
                <span v-else>{{ card.valor }}</span>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ card.titulo }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mb-4">
      <!-- ── Usuarios por rol ────────────────────────────────────────────── -->
      <VCol cols="12" md="12">
        <VCard rounded="lg" height="100%">
          <VCardItem title="Usuarios por rol">
            <template #prepend>
              <VAvatar size="40" color="primary" variant="tonal" rounded="lg">
                <VIcon icon="ri-bar-chart-horizontal-line" size="22" />
              </VAvatar>
            </template>
          </VCardItem>
          <VCardText>
            <div v-if="loading" class="d-flex justify-center py-10">
              <VProgressCircular indeterminate color="primary" />
            </div>
            <div v-else-if="!usuariosPorRol.length" class="text-center text-medium-emphasis py-10">
              Sin datos
            </div>
            <VueApexCharts v-else type="bar" height="260" :options="rolesOptions" :series="rolesSeries" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Últimos usuarios ──────────────────────────────────────────────── -->
    <VCard rounded="lg">
      <VCardItem title="Últimos usuarios registrados">
        <template #append>
          <VBtn size="x-small" variant="tonal" color="primary" to="/admin/usuarios">
            Ver todos
          </VBtn>
        </template>
      </VCardItem>
      <VDivider />
      <VTable density="comfortable">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && !ultimosUsuarios.length">
            <td colspan="6" class="text-center text-medium-emphasis">
              Sin usuarios
            </td>
          </tr>
          <tr v-for="u in ultimosUsuarios" :key="u.id">
            <td>{{ u.nombre }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>
              <VChip v-for="r in u.roles" :key="r" size="x-small" class="me-1" variant="tonal">
                {{ r }}
              </VChip>
            </td>
            <td>
              <VChip size="x-small" :color="u.estado ? 'success' : 'secondary'" variant="tonal">
                {{ u.estado ? 'Activo' : 'Inactivo' }}
              </VChip>
            </td>
            <td>{{ u.creado_en }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>
