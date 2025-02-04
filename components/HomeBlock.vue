<template>
  <div  class="border p-10">
    <h3>{{ props.message }}</h3>
    <ul>
      <li v-for="item in props.items" :key="item.id">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Item {
  id: number | string;
  text: string;
}

const props = defineProps<{
  message: string;
  items: Item[];
}>();
</script>
