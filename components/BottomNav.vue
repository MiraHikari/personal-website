<template>
  <div class="bottom-nav">
    <span>当前坐标: ({{ scrollX }}, {{ scrollY }})</span>
    <input v-model.number="inputX" type="number" placeholder="X 坐标" />
    <input v-model.number="inputY" type="number" placeholder="Y 坐标" />
    <button @click="jumpToCoordinates">跳转</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useInfiniteStore } from '~/stores/infiniteStore';
import { storeToRefs } from 'pinia';

// 直接通过 Pinia store 获取坐标
const infiniteStore = useInfiniteStore();
const { scrollX, scrollY } = storeToRefs(infiniteStore);

// 内部使用本地响应式变量，初始化为 store 中的当前值
const inputX = ref(scrollX.value);
const inputY = ref(scrollY.value);

// 当 store 中的坐标发生变化时，同步更新输入框
watch(scrollX, (newVal) => {
  inputX.value = newVal;
});
watch(scrollY, (newVal) => {
  inputY.value = newVal;
});

// 定义跳转操作：通过发送 jump 事件，将用户输入的坐标传递出去
const emit = defineEmits<{ (e: 'jump', coords: { x: number; y: number }): void }>();
function jumpToCoordinates() {
  emit('jump', { x: inputX.value, y: inputY.value });
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid #ccc;
  padding: 0 20px;
  z-index: 1001;
}
</style>
