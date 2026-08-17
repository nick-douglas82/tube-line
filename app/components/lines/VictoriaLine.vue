<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "victoria",
  colour: "#0098D4",
  routes: [
    [
      "Walthamstow Central",
      "Blackhorse Road",
      "Tottenham Hale",
      "Seven Sisters",
      "Finsbury Park",
      "Highbury & Islington",
      "King's Cross St. Pancras",
      "Euston",
      "Warren Street",
      "Oxford Circus",
      "Green Park",
      "Victoria",
      "Pimlico",
      "Vauxhall",
      "Stockwell",
      "Brixton",
    ],
  ],
  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",
    "Kings Cross St. P": "King's Cross St. Pancras",
    "Highbury & Isl": "Highbury & Islington",
  },
});
</script>

<template>
  <div />
</template>
