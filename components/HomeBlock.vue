<template>
  <div class="home-block">
    <h3>{{ message }}</h3>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

interface Item {
  id: number | string;
  text: string;
}

const props = defineProps({
  message: String,
  items: {
    type: Array as PropType<Item[]>,
    default: () => []
  }
});
</script>

<style scoped>
.home-block {
  border: 1px solid #ccc;
  background: #fff;
  padding: 10px;
}
</style>
