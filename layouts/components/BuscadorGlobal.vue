<script setup lang="ts">
const router = useRouter()

const abierto = ref(false)
const busqueda = ref('')
const resultados = ref<any[]>([])

// Menú global (cargado por el layout)
const opcionesMenu = useState<any[]>('menu', () => [])

// Ctrl+K
onMounted(() => window.addEventListener('keydown', manejarAtajo))
onUnmounted(() => window.removeEventListener('keydown', manejarAtajo))

const manejarAtajo = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    abierto.value = true
  }
  if (e.key === 'Escape')
    abierto.value = false
}

watch(abierto, val => {
  if (!val) { busqueda.value = ''; resultados.value = [] }
})

// Aplana el árbol del menú en una lista plana de ítems navegables
const aplanarMenu = (items: any[], seccion = ''): any[] => {
  const lista: any[] = []
  for (const item of items) {
    if (item.titulo_seccion) {
      // Es un separador de sección — buscar en sus hijos
      if (item.children?.length)
        lista.push(...aplanarMenu(item.children, item.titulo_seccion))
      continue
    }
    if (item.titulo && item.ruta) {
      lista.push({
        id:       item.ruta,
        titulo:   item.titulo,
        seccion:  seccion || '',
        icono:    item.icono ?? 'ri-links-line',
        ruta:     item.ruta,
      })
    }
    if (item.children?.length)
      lista.push(...aplanarMenu(item.children, item.titulo ?? seccion))
  }
  return lista
}

watch(busqueda, val => {
  if (!val || val.length < 2) {
    resultados.value = []
    return
  }
  const lower = val.toLowerCase()
  resultados.value = aplanarMenu(opcionesMenu.value)
    .filter(item => item.titulo.toLowerCase().includes(lower))
    .slice(0, 8)
})

const irA = (item: any) => {
  abierto.value = false
  try {
    router.push({ name: item.ruta })
  }
  catch {
    router.push(item.ruta)
  }
}
</script>

<template>
  <!-- Botón en navbar -->
  <IconBtn title="Buscar (Ctrl+K)" @click="abierto = true">
    <VIcon icon="ri-search-line" />
  </IconBtn>

  <!-- Dialog -->
  <VDialog v-model="abierto" max-width="520" scrollable>
    <VCard style="border-radius:12px;">

      <!-- Input -->
      <VCardText class="pa-3 pb-0">
        <VTextField
          v-model="busqueda"
          placeholder="Buscar en el menú..."
          prepend-inner-icon="ri-search-line"
          autofocus
          hide-details
          variant="outlined"
          density="compact"
          clearable
        >
          <template #append-inner>
            <VChip size="x-small" variant="outlined" class="ms-1">Esc</VChip>
          </template>
        </VTextField>
      </VCardText>

      <!-- Resultados -->
      <VCardText class="pa-3" style="min-height:180px;max-height:380px;overflow-y:auto;">

        <!-- Sugerencia inicial -->
        <div
          v-if="!busqueda"
          class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis gap-2"
        >
          <VIcon size="36" style="opacity:.3">ri-search-line</VIcon>
          <span class="text-body-2">Escribe para buscar una opción del menú</span>
          <div class="d-flex align-center gap-1 mt-1">
            <VChip size="x-small" variant="outlined">Ctrl</VChip>
            <span class="text-caption">+</span>
            <VChip size="x-small" variant="outlined">K</VChip>
          </div>
        </div>

        <!-- Sin resultados -->
        <div
          v-else-if="resultados.length === 0 && busqueda.length >= 2"
          class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis gap-2"
        >
          <VIcon size="36" style="opacity:.3">ri-file-search-line</VIcon>
          <span class="text-body-2">Sin resultados para "{{ busqueda }}"</span>
        </div>

        <!-- Lista -->
        <VList v-else-if="resultados.length > 0" density="compact" nav>
          <VListItem
            v-for="item in resultados"
            :key="item.id"
            :title="item.titulo"
            :subtitle="item.seccion"
            rounded="lg"
            class="mb-1"
            style="cursor:pointer;"
            @click="irA(item)"
          >
            <template #prepend>
              <VAvatar color="primary" variant="tonal" size="32" class="me-3">
                <VIcon :icon="item.icono" size="16" />
              </VAvatar>
            </template>
            <template #append>
              <VIcon icon="ri-corner-down-left-line" size="14" style="opacity:.4" />
            </template>
          </VListItem>
        </VList>

      </VCardText>
    </VCard>
  </VDialog>
</template>
