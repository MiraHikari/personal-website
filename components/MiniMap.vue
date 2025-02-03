<template>
  <div
    class="minimap-container"
    :style="{
      width: miniMapWidth + 'px',
      height: miniMapHeight + 'px',
      position: 'relative',
      overflow: 'hidden'
    }"
  >
    <canvas
      ref="minimapCanvas"
      :width="viewportWidth"
      :height="viewportHeight"
      :style="canvasStyle"
      class="minimap-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import html2canvas from 'html2canvas';
import { useInfiniteStore } from '~/stores/infiniteStore';
import { storeToRefs } from 'pinia';

/**
 * 父组件传入：主内容 DOM 的引用；
 * （注意：在 SSR 环境下请确保此引用已存在）
 */
const props = defineProps<{
  contentEl: HTMLElement | null;
}>();

// 小地图固定尺寸（单位：px）
const miniMapWidth = 200;
const miniMapHeight = 200;

const minimapCanvas = ref<HTMLCanvasElement | null>(null);

// 为保证窗口尺寸发生变化时能够及时取到最新的 viewport 尺寸，
const viewportWidth = ref(window.innerWidth);
const viewportHeight = ref(window.innerHeight);
function updateViewport() {
  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;
}
window.addEventListener('resize', updateViewport);

// 因为我们希望图片展示的是用户当前看到的部分，所以截取区域尺寸为 viewport 的尺寸
// 同时计算一个缩放因子，将用户视角缩放到小地图固定尺寸内
const scaleFactor = computed(() => {
  return Math.min(miniMapWidth / viewportWidth.value, miniMapHeight / viewportHeight.value);
});
const canvasStyle = computed(() => {
  return {
    width: viewportWidth.value * scaleFactor.value + 'px',
    height: viewportHeight.value * scaleFactor.value + 'px',
    transformOrigin: 'top left',
  };
});

const infiniteStore = useInfiniteStore();
const { scrollX, scrollY } = storeToRefs(infiniteStore);

/* ===== 节流函数实现 ===== */
function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (!timeout) {
      fn(...args);
      timeout = setTimeout(() => {
        timeout = null;
      }, delay);
    }
  }) as T;
}

/**
 * 使用 html2canvas 对整个内容 DOM 进行快照，
 * 然后根据滚动状态计算用户视角区域（假定大小为 viewport 尺寸），
 * 并从捕获画布中裁剪出这部分，转换为图片 data URL 赋值给 imageUrl。
 */
async function captureView() {
  if (!props.contentEl || !minimapCanvas.value) return;
  try {
    const canvas = await html2canvas(props.contentEl, {
      scale: 2,
      useCORS: true,
    });

    const userViewWidth = viewportWidth.value;
    const userViewHeight = viewportHeight.value;
    const offsetX = -Number(scrollX.value);
    const offsetY = -Number(scrollY.value);

    const ctx = minimapCanvas.value.getContext('2d');
    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, userViewWidth, userViewHeight);

      ctx.drawImage(
        canvas,
        offsetX, offsetY,
        userViewWidth, userViewHeight,
        0, 0,
        userViewWidth, userViewHeight
      );
    }
  } catch (error) {
    console.error('Error capturing view with html2canvas:', error);
  }
}

// 使用节流包装 captureView，避免频繁触发
const throttledCaptureView = throttle(captureView, 100);

// 在组件挂载时立即捕获，同时监听相关变化刷新截图
onMounted(() => {
  throttledCaptureView();
  window.addEventListener('resize', throttledCaptureView);
});
onUnmounted(() => {
  window.removeEventListener('resize', throttledCaptureView);
  window.removeEventListener('resize', updateViewport);
});

// 当 contentEl 或滚动位置（以及 viewport 大小）变化时，重新截取用户视角图片
watch(
  [() => props.contentEl, viewportWidth, viewportHeight, scrollX, scrollY],
  () => {
    throttledCaptureView();
  }
);
</script>

<style scoped>
.minimap-container {
  border: 1px solid #ccc;
  border-radius: 100%;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1001;
  position: relative;
}

.minimap-canvas {
  object-fit: contain;
}
</style>
