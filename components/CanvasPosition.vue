<template>
  <!-- 将 x 与 y 同时作为 DOM data 属性暴露，便于 InfiniteScrollView 进行排序和可见性判断 -->
  <div :style="mergedStyle" :data-x="resolvedX" :data-y="resolvedY">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue';

interface Props {
  x: number | string;
  y: number | string;
  width?: number | string;
  height?: number | string;
  rotate?: number;    // 旋转角度（单位：度）
  scale?: number;     // 局部缩放比例
  opacity?: number;   // 透明度 (0~1)
  zIndex?: number | string;
  debug?: boolean;    // 是否显示调试边框

  // 新增的便捷样式属性
  bgColor?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
}

const props = withDefaults(defineProps<Props>(), {
  x: 0,
  y: 0,
  width: 'auto',
  height: 'auto',
  rotate: 0,
  scale: 1,
  opacity: 1,
  zIndex: 'auto',
  debug: false,

  bgColor: 'transparent',
  padding: '0',
  margin: '0',
  border: 'none',
  borderRadius: '0',
  boxShadow: 'none'
});

const resolvedX = computed(() => (typeof props.x === 'number' ? props.x : parseFloat(props.x as string)));
const resolvedY = computed(() => (typeof props.y === 'number' ? props.y : parseFloat(props.y as string)));

const baseStyle = computed(() => ({
  position: 'absolute' as const,
  left: typeof props.x === 'number' ? `${props.x}px` : props.x,
  top: typeof props.y === 'number' ? `${props.y}px` : props.y,
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  opacity: props.opacity,
  zIndex: props.zIndex,
  background: props.bgColor,
  padding: props.padding,
  margin: props.margin,
  border: props.border,
  borderRadius: props.borderRadius,
  boxShadow: props.boxShadow,
  // 以 transform 处理旋转与局部缩放，不影响 left/top 定位
  transform: `scale(${props.scale}) rotate(${props.rotate}deg)`,
  ...(props.debug ? { outline: '1px dashed red' } : {})
}));

// 若需要进一步的开发配置，可在此合并其它自定义 style
const mergedStyle = computed(() => {
  return {
    ...baseStyle.value
    // 未来可以通过额外的 prop 合并开发者传入的自定义样式
  };
});
</script>

<style scoped>
/* 可在这里针对 Position 组件做一些全局调试样式 */
</style>
