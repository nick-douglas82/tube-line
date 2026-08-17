<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "circle",
  colour: "#FFD300",
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
      "Aldgate",
      "Tower Hill",
      "Monument",
      "Cannon Street",
      "Mansion House",
      "Blackfriars",
      "Temple",
      "Embankment",
      "Westminster",
      "St. James's Park",
      "Victoria",
      "Sloane Square",
      "South Kensington",
      "Gloucester Road",
      "High Street Kensington",
      "Notting Hill Gate",
      "Bayswater",
      "Paddington",
      "Edgware Road (Circle Line)",
    ],
  ],

  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",

    "Kings Cross St. P": "King's Cross St. Pancras",

    "St James's Park": "St. James's Park",

    "St James Park": "St. James's Park",

    Hammersmith: "Hammersmith (H&C Line)",

    "Edgware Road": "Edgware Road (Circle Line)",
  },
});
</script>

<template>
  <div />
</template>
