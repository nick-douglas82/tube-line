<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "northern",
  colour: "#000000",
  routes: [
    ["Edgware", "Burnt Oak", "Colindale", "Hendon Central", "Brent Cross", "Golders Green", "Hampstead", "Belsize Park", "Chalk Farm", "Camden Town"],

    ["High Barnet", "Totteridge & Whetstone", "Woodside Park", "West Finchley", "Finchley Central", "East Finchley", "Highgate", "Archway", "Tufnell Park", "Kentish Town", "Camden Town"],

    ["Mill Hill East", "Finchley Central"],

    ["Camden Town", "Mornington Crescent", "Euston", "Warren Street", "Goodge Street", "Tottenham Court Road", "Leicester Square", "Charing Cross", "Embankment", "Waterloo", "Kennington"],

    ["Camden Town", "Euston", "King's Cross St. Pancras", "Angel", "Old Street", "Moorgate", "Bank", "London Bridge", "Borough", "Elephant & Castle", "Kennington"],

    ["Kennington", "Oval", "Stockwell", "Clapham North", "Clapham Common", "Clapham South", "Balham", "Tooting Bec", "Tooting Broadway", "Colliers Wood", "South Wimbledon", "Morden"],

    ["Kennington", "Nine Elms", "Battersea Power Station"],
  ],

  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",

    "Kings Cross P7": "King's Cross St. Pancras",

    "Kings Cross P8": "King's Cross St. Pancras",
  },
});
</script>

<template>
  <div />
</template>
