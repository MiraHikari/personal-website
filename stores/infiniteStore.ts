import { defineStore } from 'pinia';

export const useInfiniteStore = defineStore('infinite', {
    state: () => ({
        scrollX: 0,
        scrollY: 0,
    }),
});
