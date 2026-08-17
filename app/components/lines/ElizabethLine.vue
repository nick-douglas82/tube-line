<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "elizabeth",
  colour: "#6950A1",

  routes: [
    [
      "Reading",
      "Twyford",
      "Maidenhead",
      "Taplow",
      "Burnham",
      "Slough",
      "Langley",
      "Iver",
      "West Drayton",
      "Hayes & Harlington",
      "Southall",
      "Hanwell",
      "West Ealing",
      "Ealing Broadway",
      "Acton Main Line",
      "Paddington",
      "Bond Street",
      "Tottenham Court Road",
      "Farringdon",
      "Liverpool Street",
      "Whitechapel",
    ],

    ["Hayes & Harlington", "Heathrow Terminals 2 & 3", "Heathrow Terminal 5"],

    ["Heathrow Terminals 2 & 3", "Heathrow Terminal 4"],

    ["Whitechapel", "Stratford", "Maryland", "Forest Gate", "Manor Park", "Ilford", "Seven Kings", "Goodmayes", "Chadwell Heath", "Romford", "Gidea Park", "Harold Wood", "Brentwood", "Shenfield"],

    ["Whitechapel", "Canary Wharf", "Custom House", "Woolwich", "Abbey Wood"],
  ],

  stationAliases: {
    "London Paddington": "Paddington",

    "London Liverpool Street": "Liverpool Street",

    "Stratford (London)": "Stratford",

    "Langley (Berks)": "Langley",

    "Burnham (Berks)": "Burnham",
  },

  stationNameSuffixesToRemove: [" Rail Station"],
});
</script>

<template>
  <div />
</template>
