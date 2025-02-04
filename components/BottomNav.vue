<template>
  <div class="fixed z-1 px-4 w-full bottom-0 pointer-events-none flex flex-col items-center">
    <UContainer
      class="flex max-w-full h-12 mb-12 items-center gap-4 p-4 pointer-events-auto transition-all ring-2 ring-gray-50/20 dark:bg-gray-900/80 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
      <!-- Current Position -->
      <div>
        <span class="font-mono"><span class="hidden md:inline">Current Position:</span> {{ Math.round(scrollX) }}, {{ Math.round(scrollY) }}</span>
      </div>

      <!-- Home Button -->
      <UButton icon="i-heroicons-home" color="gray" variant="ghost" @click="emit('navigate', 'home')"
        :ui="{ rounded: 'rounded-xl' }">
        回到原点
      </UButton>

      <!-- Jump Button -->
      <UButton icon="i-heroicons-arrows-pointing-out" color="gray" variant="ghost" @click="isOpen = true"
        :ui="{ rounded: 'rounded-xl' }">
        传送
      </UButton>
    </UContainer>
  </div>

  <!-- Jump Modal -->
  <UModal v-model="isOpen">
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrows-pointing-out" />
          <h3 class="text-base font-semibold leading-6">
            传送到指定坐标
          </h3>
        </div>
      </template>

      <UForm :state="form" @submit="handleJumpFromDialog">
        <div class="flex gap-4 py-4">
          <UFormGroup label="X 坐标" name="x">
            <UInput v-model="form.x" type="number" />
          </UFormGroup>
          <UFormGroup label="Y 坐标" name="y">
            <UInput v-model="form.y" type="number" />
          </UFormGroup>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <UButton color="gray" variant="ghost" @click="isOpen = false">
            取消
          </UButton>
          <UButton type="submit" color="primary">
            确定
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';

const props = defineProps<{
  scrollX: number;
  scrollY: number;
}>();

// Modal and Form State
const isOpen = ref(false);
const form = reactive({
  x: props.scrollX,
  y: props.scrollY
});

// Watch props changes
watch(() => props.scrollX, (newVal) => {
  form.x = newVal;
});
watch(() => props.scrollY, (newVal) => {
  form.y = newVal;
});

// Emits
const emit = defineEmits<{
  (e: 'navigate', action: 'home' | 'jump' | 'custom', coords?: { x: number; y: number }): void
}>();

// Methods
function handleJumpFromDialog() {
  emit('navigate', 'jump', { x: form.x, y: form.y });
  isOpen.value = false;
}
</script>
