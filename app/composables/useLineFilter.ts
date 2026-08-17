import { computed, ref } from "vue";
import { transportLines } from "~/config/transportLines";

/*
 * Shared across every useTubeLine instance.
 */
const hoveredLineId = ref<string | null>(null);

export const useLineFilter = () => {
  const route = useRoute();

  const router = useRouter();

  const selectedLineId = computed<string | null>(() => {
    const line = route.query.line;

    if (typeof line !== "string") {
      return null;
    }

    const exists = transportLines.some((transportLine) => transportLine.id === line);

    return exists ? line : null;
  });

  const selectedLine = computed(() => {
    if (!selectedLineId.value) {
      return null;
    }

    return transportLines.find((line) => line.id === selectedLineId.value) ?? null;
  });

  /*
   * Hover temporarily overrides the URL filter.
   *
   * As soon as hover ends, we naturally fall
   * back to the selected URL line.
   */
  const activeLineId = computed(() => {
    return hoveredLineId.value ?? selectedLineId.value;
  });

  const selectLine = async (lineId: string | null) => {
    if (!lineId) {
      await router.push({
        path: route.path,
      });

      return;
    }

    await router.push({
      path: route.path,

      query: {
        line: lineId,
      },
    });
  };

  const setHoveredLine = (lineId: string) => {
    hoveredLineId.value = lineId;
  };

  const clearHoveredLine = (lineId?: string) => {
    /*
     * Prevent one line's mouseleave from
     * clearing another line that has just
     * become hovered.
     */
    if (lineId && hoveredLineId.value !== lineId) {
      return;
    }

    hoveredLineId.value = null;
  };

  const isLineActive = (lineId: string) => {
    return !activeLineId.value || activeLineId.value === lineId;
  };

  return {
    selectedLineId,
    selectedLine,
    hoveredLineId,
    activeLineId,

    selectLine,
    setHoveredLine,
    clearHoveredLine,
    isLineActive,
  };
};
