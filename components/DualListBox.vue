<script setup>
import { computed, ref, watch } from 'vue'

// Props para el título, items disponibles y seleccionados
const props = defineProps({
  title: {
    type: String,
    default: 'Dual List Box',
  },
  items: {
    type: Array,
    default: () => [],
  },
  selectedItems: {
    type: Array,
    default: () => [],
  },
  tipo: {
    type: String,
    required: true,
  },
})

// Emitir eventos cuando los items seleccionados cambien
const emit = defineEmits(['update:selectedItems'])

// Items disponibles y seleccionados
const availableItems = ref([])
const selectedItems = ref([])

// Campos de búsqueda
const searchAvailable = ref('')
const searchSelected = ref('')

// Inicializar items
const inicializarItems = () => {
  selectedItems.value = [...props.selectedItems]
  availableItems.value = props.items.filter(
    item => !props.selectedItems.some(selected => selected.id === item.id),
  )
}

// Watcher para sincronizar props y estado interno
watch(
  () => [props.items, props.selectedItems],
  () => {
    inicializarItems()
  },
  { immediate: true, deep: true },
)

// Items filtrados según búsqueda
const filteredAvailableItems = computed(() => {
  return availableItems.value.filter(item =>
    item.name.toLowerCase().includes(searchAvailable.value.toLowerCase()),
  )
})

const filteredSelectedItems = computed(() => {
  return selectedItems.value.filter(item =>
    item.name.toLowerCase().includes(searchSelected.value.toLowerCase()),
  )
})

// Función para seleccionar un item
const selectItem = item => {
  selectedItems.value.push(item)
  availableItems.value = availableItems.value.filter(i => i.id !== item.id)
  emit('update:selectedItems', selectedItems.value)
}

// Función para deseleccionar un item
const deselectItem = item => {
  availableItems.value.push(item)
  selectedItems.value = selectedItems.value.filter(i => i.id !== item.id)
  emit('update:selectedItems', selectedItems.value)
}

// Función para mover todos los disponibles a seleccionados
const moveAllToSelected = () => {
  selectedItems.value.push(...availableItems.value)
  availableItems.value = []
  emit('update:selectedItems', selectedItems.value)
}

// Función para mover todos los seleccionados a disponibles
const moveAllToAvailable = () => {
  availableItems.value.push(...selectedItems.value)
  selectedItems.value = []
  emit('update:selectedItems', selectedItems.value)
}
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <h2 class="text-center">
          {{ `Selector de ${props.tipo}` }}
        </h2>
      </VCol>
    </VRow>

    <VRow class="d-flex justify-center">
      <!-- Lista de Disponibles -->
      <VCol
        cols="12"
        md="5"
        class="mb-4 mb-md-0"
      >
        <VCard>
          <VCardTitle class="text-h6 text-center">
            {{ props.tipo }} Disponibles
          </VCardTitle>
          <VCardText>
            <VTextField
              v-model="searchAvailable"
              :label="`Buscar en ${props.tipo} Disponibles`"
              dense
              outlined
            />
            <VList
              v-if="filteredAvailableItems.length > 0"
              class="scrollable-list"
            >
              <VListItem
                v-for="item in filteredAvailableItems"
                :key="item.id"
                class="clickable-text"
                @click="selectItem(item)"
              >
                <span>{{ item.name }}</span>
              </VListItem>
            </VList>
            <p
              v-else
              class="text-center"
            >
              No hay {{ props.tipo }} disponibles.
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Botones de mover todo -->
      <VCol
        cols="12"
        md="1"
        class="d-flex flex-row flex-md-column align-center justify-center mb-4 mb-md-0 move-all-buttons"
      >
        <VBtn
          icon
          color="primary"
          class="me-2 mb-0 me-md-0 mb-md-4"
          @click="moveAllToSelected"
        >
          <VIcon :icon="$vuetify.display.mdAndUp ? 'ri-arrow-right-double-line' : 'ri-arrow-down-double-line'" />
          <VTooltip
            activator="parent"
            location="top"
          >
            Mover todos a Seleccionados
          </VTooltip>
        </VBtn>
        <VBtn
          icon
          color="primary"
          @click="moveAllToAvailable"
        >
          <VIcon :icon="$vuetify.display.mdAndUp ? 'ri-arrow-left-double-line' : 'ri-arrow-up-double-line'" />
          <VTooltip
            activator="parent"
            location="bottom"
          >
            Mover todos a Disponibles
          </VTooltip>
        </VBtn>
      </VCol>

      <!-- Lista de Seleccionados -->
      <VCol
        cols="12"
        md="5"
      >
        <VCard>
          <VCardTitle class="text-h6 text-center">
            {{ props.tipo }} Seleccionados
          </VCardTitle>
          <VCardText>
            <VTextField
              v-model="searchSelected"
              :label="`Buscar en ${props.tipo} Seleccionados`"
              dense
              outlined
            />
            <VList
              v-if="filteredSelectedItems.length > 0"
              class="scrollable-list"
            >
              <VListItem
                v-for="item in filteredSelectedItems"
                :key="item.id"
                class="clickable-text"
                @click="deselectItem(item)"
              >
                <span>{{ item.name }}</span>
              </VListItem>
            </VList>
            <p
              v-else
              class="text-center"
            >
              No hay {{ props.tipo }} seleccionados.
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.text-center {
  text-align: center;
}

.clickable-text {
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 8px;
}

.clickable-text:hover {
  background-color: var(--button-hover-color);
}

.scrollable-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  padding: 8px;
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 960px) {
  .scrollable-list {
    max-height: 200px; /* Altura reducida para pantallas pequeñas */
  }

  .move-all-buttons {
    padding-block: 8px;
  }
}
</style>
