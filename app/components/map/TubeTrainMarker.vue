<script setup lang="ts">
defineProps<{
  colour: string;
}>();
</script>

<template>
  <div class="tube-train-marker">
    <div
      data-line-visual="true"
      class="tube-train-marker__dot"
      :style="{
        backgroundColor: colour,
      }"
    />
  </div>
</template>

<style scoped>
.tube-train-marker {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.tube-train-marker__dot {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition:
    opacity 150ms ease,
    filter 150ms ease;
}
</style>
