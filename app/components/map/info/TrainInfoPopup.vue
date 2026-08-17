<script setup lang="ts">
import { computed } from "vue";
import LineRoundel from "~/components/LineRoundel.vue";
import type { TflPrediction } from "~/types/types";

import { cleanTflStationName, formatArrivalTime } from "~/utils/tfl";

const props = defineProps<{
  vehicleId: string;
  lineId: string;
  lineName: string;
  colour: string;
  destinationName: string;
  currentLocation: string;
  predictions: TflPrediction[];
}>();

const nextStops = computed(() => {
  const seenStations = new Set<string>();

  const currentTime = Date.now() - 5_000;

  return [...props.predictions]
    .filter((prediction) => {
      const arrival = new Date(prediction.expectedArrival).getTime();

      return !Number.isNaN(arrival) && arrival >= currentTime;
    })
    .sort((firstPrediction, secondPrediction) => firstPrediction.timeToStation - secondPrediction.timeToStation)
    .filter((prediction) => {
      const stationName = cleanTflStationName(prediction.stationName);

      if (seenStations.has(stationName)) {
        return false;
      }

      seenStations.add(stationName);

      return true;
    })
    .slice(0, 10);
});
</script>

<template>
  <div class="train-info">
    <header class="train-info__header">
      <div class="train-info__line">
        <LineRoundel :colour="colour" />

        <span>
          {{ lineName }}
        </span>
      </div>

      <h2 class="train-info__title">
        {{ cleanTflStationName(destinationName) }}
      </h2>

      <div class="train-info__location">
        {{ currentLocation }}
      </div>
    </header>

    <div class="train-info__section-title">Next stops</div>

    <div v-if="nextStops.length" class="train-info__stops">
      <div v-for="prediction in nextStops" :key="`${prediction.stationName}-${prediction.expectedArrival}`" class="train-info__stop">
        <div class="train-info__stop-marker">
          <span />
        </div>

        <div class="train-info__stop-main">
          <div class="train-info__station">
            {{ cleanTflStationName(prediction.stationName) }}
          </div>

          <div v-if="prediction.platformName" class="train-info__platform">
            {{ prediction.platformName }}
          </div>
        </div>

        <div class="train-info__time">
          {{ formatArrivalTime(prediction.timeToStation) }}
        </div>
      </div>
    </div>

    <div v-else class="train-info__message">No further stop information available.</div>

    <footer class="train-info__footer">Vehicle {{ vehicleId }}</footer>
  </div>
</template>

<style scoped>
.train-info {
  width: 320px;
  color: #111827;
  font-family: Arial, sans-serif;
}

.train-info__header {
  padding: 4px 28px 14px 0;
}

.train-info__line {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 700;
}

.train-info__line :deep(svg) {
  width: 22px;
  height: 18px;
}

.train-info__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
}

.train-info__location {
  margin-top: 5px;
  color: #6b7280;
  font-size: 12px;
}

.train-info__section-title {
  padding: 10px 0 6px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.train-info__stops {
  max-height: 300px;
  overflow-y: auto;
}

.train-info__stop {
  display: flex;
  align-items: center;
  min-height: 42px;
}

.train-info__stop-marker {
  position: relative;
  align-self: stretch;
  width: 22px;
  flex: 0 0 22px;
}

.train-info__stop-marker::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 9px;
  width: 3px;
  background: v-bind(colour);
  content: "";
}

.train-info__stop-marker span {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 5px;
  width: 11px;
  height: 11px;
  border: 2px solid white;
  border-radius: 50%;
  background: v-bind(colour);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%);
}

.train-info__stop-main {
  min-width: 0;
  flex: 1;
  padding: 7px 8px;
}

.train-info__station {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.train-info__platform {
  margin-top: 2px;
  color: #6b7280;
  font-size: 11px;
}

.train-info__time {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
}

.train-info__message {
  padding: 12px 0;
  color: #6b7280;
  font-size: 13px;
}

.train-info__footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  color: #9ca3af;
  font-size: 10px;
}
</style>
