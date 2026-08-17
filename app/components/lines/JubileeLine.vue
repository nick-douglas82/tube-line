<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "jubilee",
  colour: "#A0A5A9",
  routes: [
    [
      "Stanmore",
      "Canons Park",
      "Queensbury",
      "Kingsbury",
      "Wembley Park",
      "Neasden",
      "Dollis Hill",
      "Willesden Green",
      "Kilburn",
      "West Hampstead",
      "Finchley Road",
      "Swiss Cottage",
      "St. John's Wood",
      "Baker Street",
      "Bond Street",
      "Green Park",
      "Westminster",
      "Waterloo",
      "Southwark",
      "London Bridge",
      "Bermondsey",
      "Canada Water",
      "Canary Wharf",
      "North Greenwich",
      "Canning Town",
      "West Ham",
      "Stratford",
    ],
  ],
  stationAliases: {
    "St Johns Wood": "St. John's Wood",
    "St. Johns Wood": "St. John's Wood",
  },
});
</script>

<template>
  <div />
</template>
