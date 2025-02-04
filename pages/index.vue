<template>
  <InfiniteScrollView>
    <Position x="50" y="50">
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
      <HomeBlock message="首页组件 1" :items="[
        { id: 1, text: '首页项目 1' },
        { id: 2, text: '首页项目 2' }
      ]" />
    </Position>
    <Position x="400" y="50">
      <HomeBlock message="首页组件 2" :items="[
        { id: 3, text: '首页项目 3' },
        { id: 4, text: '首页项目 4' }
      ]" />
    </Position>
    <template #empty>
      <div>
        🤔你似乎来到了什么也没有的荒原，你可以无视本提示继续探索，或返回原点
      </div>
    </template>
  </InfiniteScrollView>
</template>

<script setup lang="ts">
import InfiniteScrollView from '~/components/InfiniteScrollView.vue'
import HomeBlock from '~/components/HomeBlock.vue'
import Position from '~/components/CanvasPosition.vue'
</script>

<style scoped>
/* 首页的其他样式 */
body {
  margin: 0;
  overflow: hidden;
}

/* 可以针对 empty 区域自定义样式 */
.custom-empty {
  padding: 30px;
  border: 2px dashed #999;
  border-radius: 8px;
  background: #f0f0f0;
  color: #666;
  font-size: 20px;
}
</style>
