<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "bakerloo",
  colour: "#B36305",
  routes: [
    [
      "Harrow & Wealdstone",
      "Kenton",
      "South Kenton",
      "North Wembley",
      "Wembley Central",
      "Stonebridge Park",
      "Harlesden",
      "Willesden Junction",
      "Kensal Green",
      "Queen's Park",
      "Kilburn Park",
      "Maida Vale",
      "Warwick Avenue",
      "Paddington",
      "Edgware Road (Bakerloo)",
      "Marylebone",
      "Baker Street",
      "Regent's Park",
      "Oxford Circus",
      "Piccadilly Circus",
      "Charing Cross",
      "Embankment",
      "Waterloo",
      "Lambeth North",
      "Elephant & Castle",
    ],
  ],
  stationAliases: {
    "Elephant and Castle": "Elephant & Castle",
    "Harrow and Wealdstone": "Harrow & Wealdstone",
    "Queens Park": "Queen's Park",
    "Regents Park": "Regent's Park",
  },
});
</script>

<template>
  <div />
</template>
