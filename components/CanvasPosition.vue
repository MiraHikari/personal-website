<template>
  <!-- 将 x 与 y 同时作为 DOM data 属性暴露，便于 InfiniteScrollView 进行排序和可见性判断 -->
  <div :data-x="resolvedX" :data-y="resolvedY" class="absolute transition-opacity opacity-0 duration-1000 will-change-transform">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  x: number | string;
  y: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  x: 0,
  y: 0,
});

const resolvedX = computed(() => (typeof props.x === 'number' ? props.x : parseFloat(props.x as string)));
const resolvedY = computed(() => (typeof props.y === 'number' ? props.y : parseFloat(props.y as string)));

</script>
