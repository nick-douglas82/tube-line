<script setup lang="ts">
import { computed } from "vue";
import LineRoundel from "~/components/LineRoundel.vue";
import { transportLines } from "~/config/transportLines";
import { cleanTflStationName, formatArrivalTime } from "~/utils/tfl";
import { useStationInfo } from "~/composables/useStationInfo";

const props = defineProps<{
  stationId: string;
  fallbackName: string;
}>();

const { station, arrivals, isLoading, error } = useStationInfo(props.stationId);

const getLine = (lineId: string) => {
  return transportLines.find((line) => line.id === lineId);
};

const stationName = computed(() => {
  return cleanTflStationName(station.value?.commonName ?? props.fallbackName);
});

const lines = computed(() => {
  const ids = new Set<string>();

  station.value?.lines?.forEach((line) => {
    if (getLine(line.id)) {
      ids.add(line.id);
    }
  });

  arrivals.value.forEach((arrival) => {
    if (getLine(arrival.lineId)) {
      ids.add(arrival.lineId);
    }
  });

  return [...ids].map((lineId) => getLine(lineId)).filter((line): line is NonNullable<typeof line> => Boolean(line));
});

const nextArrivals = computed(() => {
  return arrivals.value.filter((arrival) => Boolean(getLine(arrival.lineId))).slice(0, 10);
});
</script>

<template>
  <div class="station-info">
    <header class="station-info__header">
      <div class="station-info__eyebrow">Station</div>

      <h2 class="station-info__title">
        {{ stationName }}
      </h2>

      <div v-if="lines.length" class="station-info__lines">
        <div v-for="line in lines" :key="line.id" class="station-info__line" :title="line.name">
          <LineRoundel :colour="line.colour" />

          <span>
            {{ line.name }}
          </span>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="station-info__message">Loading live arrivals…</div>

    <div v-else-if="error" class="station-info__message">
      {{ error }}
    </div>

    <template v-else>
      <div class="station-info__section-title">Next trains</div>

      <div v-if="nextArrivals.length" class="station-info__arrivals">
        <div v-for="arrival in nextArrivals" :key="`${arrival.lineId}-${arrival.vehicleId}-${arrival.expectedArrival}`" class="station-info__arrival">
          <div class="station-info__arrival-line">
            <LineRoundel :colour="getLine(arrival.lineId)?.colour ?? '#6B7280'" />
          </div>

          <div class="station-info__arrival-main">
            <div class="station-info__destination">
              {{ cleanTflStationName(arrival.destinationName) }}
            </div>

            <div class="station-info__platform">
              {{ arrival.platformName || arrival.lineName }}
            </div>
          </div>

          <div class="station-info__time">
            {{ formatArrivalTime(arrival.timeToStation) }}
          </div>
        </div>
      </div>

      <div v-else class="station-info__message">No live arrivals currently available.</div>
    </template>
  </div>
</template>

<style scoped>
.station-info {
  width: 320px;
  color: #111827;
  font-family: Arial, sans-serif;
}

.station-info__header {
  padding: 4px 28px 14px 0;
}

.station-info__eyebrow {
  margin-bottom: 3px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.station-info__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
}

.station-info__lines {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: 12px;
}

.station-info__line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.station-info__line :deep(svg) {
  width: 20px;
  height: 16px;
}

.station-info__section-title {
  padding: 10px 0 6px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.station-info__arrivals {
  max-height: 300px;
  overflow-y: auto;
}

.station-info__arrival {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.station-info__arrival:last-child {
  border-bottom: 0;
}

.station-info__arrival-line {
  width: 25px;
  flex: 0 0 25px;
}

.station-info__arrival-line :deep(svg) {
  width: 22px;
  height: 18px;
}

.station-info__arrival-main {
  min-width: 0;
  flex: 1;
}

.station-info__destination {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.station-info__platform {
  margin-top: 2px;
  overflow: hidden;
  color: #6b7280;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.station-info__time {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
}

.station-info__message {
  padding: 12px 0;
  color: #6b7280;
  font-size: 13px;
}
</style>
