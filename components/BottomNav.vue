<template>
  <div class="dock glass bg-none backdrop-blur-3xl rounded-2xl container px-2 fixed bottom-4 mx-auto">
    <span>{{Math.round(scrollX)}}, {{Math.round(scrollY)}}</span>

    <!-- Jump Dialog Trigger -->
    <button class="tooltip tooltip-top" data-tip="跳转到坐标" @click="showJumpDialog = true">
      <Icon name="lucide:move" class="size-[1.2em]" />
      <span class="dock-label">跳转</span>
    </button>
  </div>

  <!-- Jump Dialog -->
  <div id="jump_modal" :class="{ 'modal': true, 'modal-open': showJumpDialog }">
    <div class="modal-box border">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name="lucide:move" class="size-5" />
        跳转到坐标
      </h3>
      <div class="flex gap-4 mb-4">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">X 坐标</span>
          </label>
          <input v-model.number="inputX" type="number" class="input input-bordered w-full" />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Y 坐标</span>
          </label>
          <input v-model.number="inputY" type="number" class="input input-bordered w-full" />
        </div>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost mr-2" @click="showJumpDialog = false">
            <Icon name="lucide:x" class="size-4" />
            取消
          </button>
          <button class="btn btn-primary" @click="handleJumpFromDialog">
            <Icon name="lucide:check" class="size-4" />
            确定
          </button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="showJumpDialog = false">
      <button>close</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { storeToRefs } from 'pinia';

const props = defineProps<{
  scrollX: number;
  scrollY: number;
}>();

// Jump Dialog State
const showJumpDialog = ref(false);
const inputX = ref(props.scrollX);
const inputY = ref(props.scrollY);

// Watch props changes
watch(() => props.scrollX, (newVal) => {
  inputX.value = newVal;
});
watch(() => props.scrollY, (newVal) => {
  inputY.value = newVal;
});

// Emits
const emit = defineEmits<{
  (e: 'navigate', action: 'home' | 'jump' | 'custom', coords?: { x: number; y: number }): void
}>();

// Methods
function handleJumpFromDialog() {
  emit('navigate', 'jump', { x: inputX.value, y: inputY.value });
  console.log('jump', inputX.value, inputY.value);
  showJumpDialog.value = false;
}
</script>
