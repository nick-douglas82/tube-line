<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { transportLines } from "~/config/transportLines";
import { useLineFilter } from "~/composables/useLineFilter";

const { selectedLine, selectedLineId, selectLine } = useLineFilter();

const isOpen = ref(false);

const filterElement = useTemplateRef<HTMLElement>("filterElement");

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const chooseLine = async (lineId: string | null) => {
  await selectLine(lineId);

  close();
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (filterElement.value?.contains(target)) {
    return;
  }

  close();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);

  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);

  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div ref="filterElement" class="line-filter">
    <button type="button" class="line-filter__control" :aria-expanded="isOpen" @click="toggle">
      <div class="line-filter__selected">
        <LineRoundel v-if="selectedLine" :colour="selectedLine.colour" />

        <LineRoundel v-else colour="#6B7280" />

        <div class="line-filter__selected-content">
          <span>
            {{ selectedLine?.name ?? "All Lines" }}
          </span>

          <LinePattern v-if="selectedLine" :colour="selectedLine.colour" />
        </div>
      </div>

      <span
        class="line-filter__chevron"
        :class="{
          'line-filter__chevron--open': isOpen,
        }"
      >
        ▾
      </span>
    </button>

    <div v-if="isOpen" class="line-filter__dropdown">
      <button
        type="button"
        class="line-filter__option"
        :class="{
          'line-filter__option--selected': !selectedLineId,
        }"
        @click="chooseLine(null)"
      >
        <LineRoundel colour="#6B7280" />

        <div class="line-filter__option-content">
          <span>All Lines</span>
        </div>
      </button>

      <button
        v-for="line in transportLines"
        :key="line.id"
        type="button"
        class="line-filter__option"
        :class="{
          'line-filter__option--selected': selectedLineId === line.id,
        }"
        @click="chooseLine(line.id)"
      >
        <LineRoundel :colour="line.colour" />

        <div class="line-filter__option-content">
          <span>
            {{ line.name }}
          </span>

          <LinePattern :colour="line.colour" />
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-filter {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 260px;
  z-index: 1000;
  font-family: Arial, sans-serif;
}

.line-filter__control {
  width: 100%;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  text-align: left;
  color: #111827;
}

.line-filter__selected {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.line-filter__selected-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
}

.line-filter__chevron {
  font-size: 16px;
  transition: transform 0.15s ease;
}

.line-filter__chevron--open {
  transform: rotate(180deg);
}

.line-filter__dropdown {
  margin-top: 8px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  padding: 6px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.line-filter__option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  text-align: left;
  color: #111827;
}

.line-filter__option:hover {
  background: #f3f4f6;
}

.line-filter__option--selected {
  background: #f3f4f6;
}

.line-filter__option-content {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 600;
}
</style>
