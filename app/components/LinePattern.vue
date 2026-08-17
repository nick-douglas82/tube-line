<script setup lang="ts">
defineProps<{
  colour: string;
}>();
</script>

<template>
  <div class="line-pattern">
    <span class="line-pattern__short" :style="{ backgroundColor: colour }" />

    <span class="line-pattern__long" :style="{ backgroundColor: colour }" />

    <span class="line-pattern__short" :style="{ backgroundColor: colour }" />
  </div>
</template>

<style scoped>
.line-pattern {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.line-pattern span {
  display: block;
  height: 3px;
  border-radius: 999px;
}

.line-pattern__short {
  width: 10px;
}

.line-pattern__long {
  width: 34px;
}
</style>
