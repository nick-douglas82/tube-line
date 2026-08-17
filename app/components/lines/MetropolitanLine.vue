<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "metropolitan",
  colour: "#9B0056",
  routes: [
    ["Aldgate", "Liverpool Street", "Moorgate", "Barbican", "Farringdon", "King's Cross St. Pancras", "Euston Square", "Great Portland Street", "Baker Street", "Finchley Road", "Wembley Park", "Preston Road", "Northwick Park", "Harrow-on-the-Hill"],

    ["Harrow-on-the-Hill", "West Harrow", "Rayners Lane", "Eastcote", "Ruislip Manor", "Ruislip", "Ickenham", "Hillingdon", "Uxbridge"],

    ["Harrow-on-the-Hill", "North Harrow", "Pinner", "Northwood Hills", "Northwood", "Moor Park", "Croxley", "Watford"],

    ["Harrow-on-the-Hill", "North Harrow", "Pinner", "Northwood Hills", "Northwood", "Moor Park", "Rickmansworth", "Chorleywood", "Chalfont & Latimer", "Amersham"],

    ["Chalfont & Latimer", "Chesham"],
  ],

  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",

    "Kings Cross St. P": "King's Cross St. Pancras",

    "Harrow on the Hill": "Harrow-on-the-Hill",

    "Chalfont and Latimer": "Chalfont & Latimer",
  },
});
</script>

<template>
  <div />
</template>
