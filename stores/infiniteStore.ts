import { defineStore } from 'pinia';

export const useInfiniteStore = defineStore('infinite', {
  state: () => ({
    // 保存平移位置及传送点数据
    scrollX: 0,
    scrollY: 0,
  }),
  // 开启持久化（localStorage 默认配置）
  persist: true,
});
