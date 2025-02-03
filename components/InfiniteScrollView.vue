<template>
  <div ref="scrollContainer" class="infinite-scroll-container" @touchstart.prevent="handleTouchStart" @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd">
      class="scroll-content transform-gpu will-change-transform transition-all duration-300 ease-out"
    <div ref="contentContainer" class="scroll-content" :style="scrollContentStyle">
      <slot></slot>
      leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <transition name="empty-fade" mode="out-in">
      <div v-if="!hasVisibleContent" key="empty" class="empty-region">
      {{ isMobile ? '单指拖动移动画布' : '拖动以平移画布，滚轮滚动向下/上移动' }}
          <div class="empty-default">这里空空如也……</div>
    <BottomNav @jump="handleJump" />
  </div>
    </transition>
    <!-- 小地图组件: 暂时存在问题, 等待有时间修复 -->
    <!-- <ClientOnly>
      <MiniMap :contentEl="contentContainer" />
    </ClientOnly> -->
  </div>

  <!-- 操作提示 -->
  <div class="operation-tooltip">{{ operationTooltip }}</div>

  <!-- 底部导航 -->
  <BottomNav @jump="handleJump" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onUpdated, nextTick, watch, computed } from 'vue';
import gsap from 'gsap';
import BottomNav from '~/components/BottomNav.vue';
import { useInfiniteStore } from '~/stores/infiniteStore';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '~/composables/useIsMobile';

interface Coords {
  x: number;
  y: number;
}
interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
interface Touch {
  x: number;
  y: number;
}

// 检测是否为移动设备
const { isMobile } = useIsMobile();

// 操作提示文本
const defaultDesktopTip = '拖动以平移画布，滚轮滚动向下/上移动';
const defaultMobileTip = '单指拖动移动画布';
const draggingTip = '正在拖动...';

const operationTooltip = ref(isMobile.value ? defaultMobileTip : defaultDesktopTip);

// DOM 引用
const scrollContainer = ref<HTMLElement | null>(null);
const contentContainer = ref<HTMLElement | null>(null);

// 从 Pinia 中获取状态：滚动位置 & 传送点数据
const infiniteStore = useInfiniteStore();
const { scrollX, scrollY } = storeToRefs(infiniteStore);

// 局部状态：拖拽及内容平移动画
const isDragging = ref<boolean>(false);
const scrollContentStyle = ref<{ transform: string }>({
  transform: `translate3d(${scrollX.value}px, ${scrollY.value}px, 0) scale(1)`
});

// 更新滚动位置的辅助函数
function updateScroll(x: number, y: number) {
  infiniteStore.$patch({
    scrollX: x,
    scrollY: y
  });
}

watch([scrollX, scrollY], () => {
  scrollContentStyle.value.transform = `translate3d(${scrollX.value}px, ${scrollY.value}px, 0) scale(1)`;
});

// 定义 viewport 大小
const viewportWidth = ref(0);
const viewportHeight = ref(0);

// 触摸相关状态
const lastTouch = ref<Touch | null>(null);
const initialTouchDistance = ref<number>(0);
const isMultiTouch = ref<boolean>(false);
const touchVelocity = ref<{ x: number; y: number }>({ x: 0, y: 0 });
let lastTouchTime = 0;

// 手势事件处理函数
const handleGestureStart = (e: Event) => e.preventDefault();
const handleGestureChange = (e: Event) => e.preventDefault();
const handleGestureEnd = (e: Event) => e.preventDefault();

// 处理触摸事件
function handleTouchStart(event: TouchEvent): void {
  event.preventDefault();
  if (event.touches.length === 1) {
    // 单指触摸
    const touch = event.touches[0];
    lastTouch.value = {
      x: touch.clientX - scrollX.value,
      y: touch.clientY - scrollY.value
    };
    lastTouchTime = Date.now();
    touchVelocity.value = { x: 0, y: 0 };
    isMultiTouch.value = false;
  } else if (event.touches.length === 2) {
    // 双指触摸 - 记录初始距离用于缩放
    isMultiTouch.value = true;
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    initialTouchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
}

function handleTouchMove(event: TouchEvent): void {
  event.preventDefault();
  if (!lastTouch.value) return;

  if (event.touches.length === 1 && !isMultiTouch.value) {
    // 单指移动
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastTouch.value.x;
    const deltaY = touch.clientY - lastTouch.value.y;

    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime;
    if (timeDelta > 0) {
      touchVelocity.value = {
        x: (deltaX - scrollX.value) / timeDelta,
        y: (deltaY - scrollY.value) / timeDelta
      };
    }

    gsap.to(scrollContentStyle.value, {
      transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1)`,
      duration: 0.1,
      overwrite: true,
      onUpdate: () => {
        const matrix = new DOMMatrix(scrollContentStyle.value.transform);
        updateScroll(matrix.m41, matrix.m42);
      }
    });

    lastTouchTime = currentTime;
  } else if (event.touches.length === 2) {
    // 双指缩放 - 这里可以添加缩放逻辑
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    // 这里可以根据 currentDistance 和 initialTouchDistance 的比例来实现缩放
  }
}

function handleTouchEnd(event: TouchEvent): void {
  if (!isMultiTouch.value && touchVelocity.value) {
    // 添加惯性滚动
    const velocityX = touchVelocity.value.x * 100;
    const velocityY = touchVelocity.value.y * 100;
    const currentMatrix = new DOMMatrix(scrollContentStyle.value.transform);
    const targetX = currentMatrix.m41 + velocityX;
    const targetY = currentMatrix.m42 + velocityY;

    gsap.to(scrollContentStyle.value, {
      transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        const matrix = new DOMMatrix(scrollContentStyle.value.transform);
        updateScroll(matrix.m41, matrix.m42);
      }
    });
  }

  lastTouch.value = null;
  isMultiTouch.value = false;
  touchVelocity.value = { x: 0, y: 0 };
}

// 拖拽及滚动事件
let startX = 0;
let startY = 0;
let isRafScheduled = false;
let pendingX = 0;
let pendingY = 0;
function handleMouseDown(event: MouseEvent): void {
  isDragging.value = true;
  startX = event.clientX - scrollX.value;
  startY = event.clientY - scrollY.value;
  operationTooltip.value = draggingTip;
}
function handleMouseUp(): void {
  isDragging.value = false;
  operationTooltip.value = isMobile.value ? defaultMobileTip : defaultDesktopTip;
}
function handleMouseMove(event: MouseEvent): void {
  if (!isDragging.value) return;
  pendingX = event.clientX - startX;
  pendingY = event.clientY - startY;
  if (!isRafScheduled) {
    isRafScheduled = true;
    requestAnimationFrame(() => {
      gsap.to(scrollX, { value: pendingX, duration: 0.1, overwrite: true, ease: 'power2.out' });
      gsap.to(scrollY, { value: pendingY, duration: 0.1, overwrite: true, ease: 'power2.out' });
      isRafScheduled = false;
    });
  }
}
function handleKeyDown(event: KeyboardEvent): void {
  // 与传送点对话框相关的处理已移除
  const offset = 50;
  switch (event.key) {
    case 'ArrowLeft':
      gsap.to(scrollX, { value: scrollX.value + offset, duration: 0.1, overwrite: true });
      break;
    case 'ArrowRight':
      gsap.to(scrollX, { value: scrollX.value - offset, duration: 0.1, overwrite: true });
      break;
    case 'ArrowUp':
      gsap.to(scrollY, { value: scrollY.value + offset, duration: 0.1, overwrite: true });
      break;
    case 'ArrowDown':
      gsap.to(scrollY, { value: scrollY.value - offset, duration: 0.1, overwrite: true });
      break;
  }
}
function handleJump(coords: Coords): void {
  const targetX = viewportWidth.value / 2 - coords.x;
  const targetY = viewportHeight.value / 2 - coords.y;
  gsap.to(scrollX, { value: targetX, duration: 0.3, overwrite: true, ease: 'power2.out' });
  gsap.to(scrollY, { value: targetY, duration: 0.3, overwrite: true, ease: 'power2.out' });
}
function handleWheel(event: WheelEvent): void {
  event.preventDefault();
  const newY = scrollY.value + event.deltaY;
  gsap.to(scrollY, { value: newY, duration: 0.2, overwrite: true, ease: 'power2.out' });
}

// 根据 contentContainer 内标记数据计算内容区域
function computeContentBounds(): Bounds | null {
  if (!contentContainer.value) return null;
  const children = Array.from(contentContainer.value.children).filter(child =>
    child.hasAttribute('data-x') && child.hasAttribute('data-y')
  ) as HTMLElement[];
  if (children.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  children.forEach(child => {
    const x = parseFloat(child.getAttribute('data-x')!) || 0;
    const y = parseFloat(child.getAttribute('data-y')!) || 0;
    const width = child.offsetWidth || 0;
    const height = child.offsetHeight || 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  return { minX, minY, maxX, maxY };
}
const contentBounds = ref<Bounds | null>(null);
watch(
  () => contentContainer.value,
  () => {
    nextTick(() => {
      contentBounds.value = computeContentBounds();
    });
  },
  { immediate: true }
);

// 检测空白区域（确保内容与视口有交集）
const hasVisibleContent = ref<boolean>(false);

function arrangeSlotComponents(): void {
  if (!contentContainer.value) return;
  const children = Array.from(contentContainer.value.children).filter(
    (child): child is HTMLElement => child.hasAttribute('data-x') && child.hasAttribute('data-y')
  );
  children
    .sort((a, b) => {
      const ax = parseFloat(a.getAttribute('data-x')!) || 0;
      const bx = parseFloat(b.getAttribute('data-x')!) || 0;
      if (ax === bx) {
        const ay = parseFloat(a.getAttribute('data-y')!) || 0;
        const by = parseFloat(b.getAttribute('data-y')!) || 0;
        return ay - by;
      }
      return ax - bx;
    })
    .forEach((child) => {
      child.style.position = 'absolute';
      child.style.left = `${child.getAttribute('data-x')}px`;
      child.style.top = `${child.getAttribute('data-y')}px`;
      contentContainer.value!.appendChild(child);
    });
}

let updateViewport: () => void;
let checkEmptyRegion: () => void;

onMounted(() => {
  // 初始化 viewport 尺寸
  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;

  updateViewport = () => {
    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;
  };

  checkEmptyRegion = () => {
    if (!contentContainer.value) {
      hasVisibleContent.value = false;
      return;
    }
    contentBounds.value = computeContentBounds();
    if (!contentBounds.value) {
      hasVisibleContent.value = false;
      return;
    }
    const viewLeft = -scrollX.value;
    const viewTop = -scrollY.value;
    const viewRight = viewLeft + window.innerWidth;
    const viewBottom = viewTop + window.innerHeight;
    const bounds = contentBounds.value;
    const intersects = !(bounds.maxX < viewLeft || bounds.minX > viewRight ||
      bounds.maxY < viewTop || bounds.minY > viewBottom);
    hasVisibleContent.value = intersects;
  };

  if (scrollContainer.value) {
    if (!isMobile.value) {
      scrollContainer.value.addEventListener('mousedown', handleMouseDown);
      scrollContainer.value.addEventListener('wheel', handleWheel, { passive: false });
    }
  }

  if (!isMobile.value) {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
  }

  window.addEventListener('resize', updateViewport);
  window.addEventListener('resize', checkEmptyRegion);

  // 使用存储的引用添加监听器
  document.addEventListener('gesturestart', handleGestureStart);
  document.addEventListener('gesturechange', handleGestureChange);
  document.addEventListener('gestureend', handleGestureEnd);

  watch([scrollX, scrollY], () => {
    requestAnimationFrame(checkEmptyRegion);
  });

  nextTick(() => {
    arrangeSlotComponents();
    checkEmptyRegion();
  });
});

onUpdated(() => {
  nextTick(() => {
    arrangeSlotComponents();
    if (checkEmptyRegion) checkEmptyRegion();
  });
});

onUnmounted(() => {
  if (scrollContainer.value && !isMobile.value) {
    scrollContainer.value.removeEventListener('mousedown', handleMouseDown);
    scrollContainer.value.removeEventListener('wheel', handleWheel);
  }

  if (!isMobile.value) {
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('keydown', handleKeyDown);
  }

  window.removeEventListener('resize', updateViewport);
  window.removeEventListener('resize', checkEmptyRegion);

  // 使用相同的引用移除监听器
  document.removeEventListener('gesturestart', handleGestureStart);
  document.removeEventListener('gesturechange', handleGestureChange);
  document.removeEventListener('gestureend', handleGestureEnd);
});
</script>

<style scoped>
.infinite-scroll-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #fafafa;
  touch-action: none;
  -webkit-overflow-scrolling: touch;
  user-select: none;
  -webkit-user-select: none;
}
.empty-fade-leave-active {
.scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform-origin: 0 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.empty-fade-enter-from,
.empty-region {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  text-align: center;
  z-index: 10;
}
/* 强制隐藏滚动条 */
.empty-default {
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background: linear-gradient(45deg, #f9f9f9, #e9e9e9);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
  /* Firefox */
.infinite-scroll-container::-webkit-scrollbar {
  display: none;
  transition: opacity 0.5s ease;
}

</style>
.operation-tooltip {
  position: fixed;
  top: env(safe-area-inset-top, 10px);
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 12px;
  border-radius: 20px;
  z-index: 1000;
  font-size: 14px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);    padding: 6px 10px;
  }
