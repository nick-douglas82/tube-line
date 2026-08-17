<script setup lang="ts">
import { Map as MapLibreMap, setWorkerUrl, type Map as MapLibreMapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { tubeMapKey } from "~/composables/useTubeMap";
import VictoriaLine from "~/components/lines/VictoriaLine.vue";
import CentralLine from "~/components/lines/CentralLine.vue";
import JubileeLine from "~/components/lines/JubileeLine.vue";
import NorthernLine from "~/components/lines/NorthernLine.vue";
import PiccadillyLine from "~/components/lines/PiccadillyLine.vue";
import BakerlooLine from "~/components/lines/BakerlooLine.vue";
import MetropolitanLine from "~/components/lines/MetropolitanLine.vue";
import DistrictLine from "~/components/lines/DistrictLine.vue";
import CircleLine from "~/components/lines/CircleLine.vue";
import HammersmithCityLine from "~/components/lines/HammersmithCityLine.vue";
import WaterlooCityLine from "~/components/lines/WaterlooCityLine.vue";
import ElizabethLine from "~/components/lines/ElizabethLine.vue";
import LineFilter from "~/components/LineFilter.vue";

setWorkerUrl(workerUrl);

const mapElement = useTemplateRef<HTMLDivElement>("mapElement");

const map = shallowRef<MapLibreMapType | null>(null);

provide(tubeMapKey, map);

onMounted(() => {
  const container = mapElement.value;

  if (!container) {
    return;
  }

  map.value = new MapLibreMap({
    container,
    center: [-0.1278, 51.5074],
    zoom: 11,
    style: "https://tiles.openfreemap.org/styles/liberty",
  });
});

onUnmounted(() => {
  map.value?.remove();
});
</script>

<template>
  <div ref="mapElement" style="width: 100%; height: 100vh" />

  <LineFilter />

  <VictoriaLine />
  <CentralLine />
  <JubileeLine />
  <NorthernLine />
  <PiccadillyLine />
  <BakerlooLine />
  <MetropolitanLine />
  <DistrictLine />
  <CircleLine />
  <HammersmithCityLine />
  <WaterlooCityLine />
  <ElizabethLine />
</template>
