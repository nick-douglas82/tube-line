<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "hammersmith-city",
  colour: "#F3A9BB",
  routes: [
    [
      "Hammersmith (H&C Line)",
      "Goldhawk Road",
      "Shepherd's Bush Market",
      "Wood Lane",
      "Latimer Road",
      "Ladbroke Grove",
      "Westbourne Park",
      "Royal Oak",
      "Paddington",
      "Edgware Road (Circle Line)",
      "Baker Street",
      "Great Portland Street",
      "Euston Square",
      "King's Cross St. Pancras",
      "Farringdon",
      "Barbican",
      "Moorgate",
      "Liverpool Street",
      "Aldgate East",
      "Whitechapel",
      "Stepney Green",
      "Mile End",
      "Bow Road",
      "Bromley-by-Bow",
      "West Ham",
      "Plaistow",
      "Upton Park",
      "East Ham",
      "Barking",
    ],
  ],

  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",

    "Kings Cross St. P": "King's Cross St. Pancras",

    Hammersmith: "Hammersmith (H&C Line)",

    "Edgware Road": "Edgware Road (Circle Line)",
  },
});
</script>

<template>
  <div />
</template>
