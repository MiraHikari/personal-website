<template>
  <div ref="scrollContainer" :class="{ 'w-screen h-screen overflow-hidden relative': true, 'cursor-grab select-none': isDragging }" @touchstart.prevent="handleTouchStart"
    @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd" @mousedown="handleMouseDown"
    @mousemove="handleMouseMove" @mouseup="handleMouseUp" @wheel.prevent="handleWheel">
    <!-- 滚动画布 -->
    <div ref="contentContainer"
      class="absolute top-0 left-0 w-full h-full">
      <slot></slot>
    </div>
    <transition enter-active-class="transition-opacity duration-500 ease-in"
      leave-active-class="transition-opacity duration-500 ease-out" enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div v-if="!hasVisibleContent" key="empty"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center z-10">
        <slot name="empty">
          <div class="p-5 border border-dashed rounded-lg shadow-md">
            这里空空如也……
          </div>
        </slot>
      </div>
    </transition>
  </div>
  <BottomNav
    :scrollX="scrollX"
    :scrollY="scrollY"
    @navigate="handleNavigation"
  />
  <!-- 操作提示 -->
  <ClientOnly>
    <div class="fixed top-2.5 right-2.5 bg-black/80 text-white px-2.5 py-1.5 rounded z-50 text-sm">
      {{ operationTooltip }}
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, nextTick, watch } from 'vue';
import { useWindowSize, useBreakpoints, onKeyStroke } from '@vueuse/core';
import BottomNav from '~/components/BottomNav.vue';
import { useInfiniteStore } from '~/stores/infiniteStore';
import { useTransformManager } from '~/composables/useTransformManager';
import { useContentManager } from '~/composables/useContentManager';
import { useInteractionManager } from '~/composables/useInteractionManager';

// Store and State
const infiniteStore = useInfiniteStore();
const scrollX = ref(infiniteStore.scrollX);
const scrollY = ref(infiniteStore.scrollY);

// Watch for scroll changes and persist to store
watch([scrollX, scrollY], ([newX, newY]) => {
  infiniteStore.$patch({
    scrollX: newX,
    scrollY: newY
  });
}, { flush: 'sync' });

// Provide scroll position update function
function updateScrollPosition(deltaX: number, deltaY: number) {
  scrollX.value += deltaX;
  scrollY.value += deltaY;
}

// Responsive
const breakpoints = useBreakpoints({
  mobile: 768
})
const isMobile = breakpoints.smaller('mobile')

// DOM References and Measurements
const scrollContainer = ref<HTMLElement | null>(null);
const contentContainer = ref<HTMLElement | null>(null);
const { width: viewportWidth, height: viewportHeight } = useWindowSize();

// Initialize managers
const transformManager = useTransformManager(scrollX, scrollY, updateScrollPosition);
const contentManager = useContentManager(
  contentContainer,
  scrollContainer,
  transformManager
);

const {
  isDragging,
  operationTooltip,
  handleNavigation,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleWheel,
  keyActions
} = useInteractionManager(
  scrollX,
  scrollY,
  viewportWidth,
  viewportHeight,
  isMobile,
  (deltaX: number, deltaY: number) =>
    transformManager.updateTransform({ deltaX, deltaY })
);

// Expose content manager properties
const { hasVisibleContent } = contentManager;

// Lifecycle hooks
onMounted(() => {
  // Only arrange content once after mount
  nextTick(contentManager.arrangeContent);
});

// Keyboard Controls
onKeyStroke(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], (e: KeyboardEvent) => {
  e.preventDefault();
  keyActions[e.key as keyof typeof keyActions]?.();
});
</script>
