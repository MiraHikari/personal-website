<template>
  <div
    class="w-[200px] h-[200px] border rounded-full bg-gray-900 z-[1001] fixed overflow-hidden top-2.5 left-2.5"
  >
    <div
      ref="minimapContent"
      class="minimap-content pointer-events-none absolute inset-0"
      :style="{
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'top left'
      }"
    >
      <div
        class="minimap-viewport absolute inset-0"
      >
        <div ref="clonedContent" class="pointer-events-none [&>*]:pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useInfiniteStore } from '~/stores/infiniteStore';
import { storeToRefs } from 'pinia';

/**
 * 父组件传入：主内容 DOM 的引用；
 */
const props = defineProps<{
  contentEl: HTMLElement | null;
}>();

// 小地图固定尺寸（单位：px）
const miniMapWidth = 200;
const miniMapHeight = 200;

const minimapContent = ref<HTMLElement | null>(null);
const clonedContent = ref<HTMLElement | null>(null);

// 为保证窗口尺寸发生变化时能够及时取到最新的 viewport 尺寸，
const viewportWidth = ref(window.innerWidth);
const viewportHeight = ref(window.innerHeight);
function updateViewport() {
  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;
}
window.addEventListener('resize', updateViewport);

// 计算缩放因子
const scaleFactor = computed(() => {
  return Math.min(miniMapWidth / viewportWidth.value, miniMapHeight / viewportHeight.value);
});

const infiniteStore = useInfiniteStore();
const { scrollX, scrollY } = storeToRefs(infiniteStore);
/**
 * 克隆内容并更新小地图
 */
function updateMinimap() {
  if (!props.contentEl || !clonedContent.value) return;

  // 清空现有内容
  clonedContent.value.innerHTML = '';

  // 克隆内容
  const clone = props.contentEl.cloneNode(true) as HTMLElement;

  // 移除不需要的交互元素和样式
  clone.querySelectorAll('button, input, textarea, [role="button"]').forEach(el => el.remove());
  clone.style.pointerEvents = 'none';

  // 添加克隆的内容
  clonedContent.value.appendChild(clone);
}


// 在组件挂载时初始化
onMounted(() => {
  updateMinimap();
  window.addEventListener('resize', updateMinimap);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMinimap);
  window.removeEventListener('resize', updateViewport);
});

// 监听内容变化和滚动位置
watch(
  [scrollX, scrollY, viewportWidth, viewportHeight],
  () => {
    updateMinimap();
  }
);
</script>
