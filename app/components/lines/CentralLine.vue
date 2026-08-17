<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "central",
  colour: "#E32017",
  routes: [
    ["West Ruislip", "Ruislip Gardens", "South Ruislip", "Northolt", "Greenford", "Perivale", "Hanger Lane", "North Acton"],
    ["Ealing Broadway", "West Acton", "North Acton"],
    [
      "North Acton",
      "East Acton",
      "White City",
      "Shepherd's Bush",
      "Holland Park",
      "Notting Hill Gate",
      "Queensway",
      "Lancaster Gate",
      "Marble Arch",
      "Bond Street",
      "Oxford Circus",
      "Tottenham Court Road",
      "Holborn",
      "Chancery Lane",
      "St. Paul's",
      "Bank",
      "Liverpool Street",
      "Bethnal Green",
      "Mile End",
      "Stratford",
      "Leyton",
      "Leytonstone",
    ],
    ["Leytonstone", "Snaresbrook", "South Woodford", "Woodford", "Buckhurst Hill", "Loughton", "Debden", "Theydon Bois", "Epping"],
    ["Leytonstone", "Wanstead", "Redbridge", "Gants Hill", "Newbury Park", "Barkingside", "Fairlop", "Hainault", "Grange Hill", "Chigwell", "Roding Valley", "Woodford"],
  ],
  stationAliases: {
    "Shepherds Bush": "Shepherd's Bush",
    "St Pauls": "St. Paul's",
    "St. Pauls": "St. Paul's",
  },
  stationNameSuffixesToRemove: [" (Central)"],
});
</script>

<template>
  <div />
</template>
