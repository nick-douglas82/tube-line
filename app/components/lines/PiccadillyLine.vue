<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "piccadilly",
  colour: "#003688",
  routes: [
    [
      "Cockfosters",
      "Oakwood",
      "Southgate",
      "Arnos Grove",
      "Bounds Green",
      "Wood Green",
      "Turnpike Lane",
      "Manor House",
      "Finsbury Park",
      "Arsenal",
      "Holloway Road",
      "Caledonian Road",
      "King's Cross St. Pancras",
      "Russell Square",
      "Holborn",
      "Covent Garden",
      "Leicester Square",
      "Piccadilly Circus",
      "Green Park",
      "Hyde Park Corner",
      "Knightsbridge",
      "South Kensington",
      "Gloucester Road",
      "Earl's Court",
      "Barons Court",
      "Hammersmith (Dist&Picc Line)",
      "Turnham Green",
      "Acton Town",
    ],

    ["Acton Town", "Ealing Common", "North Ealing", "Park Royal", "Alperton", "Sudbury Town", "Sudbury Hill", "South Harrow", "Rayners Lane", "Eastcote", "Ruislip Manor", "Ruislip", "Ickenham", "Hillingdon", "Uxbridge"],

    ["Acton Town", "South Ealing", "Northfields", "Boston Manor", "Osterley", "Hounslow East", "Hounslow Central", "Hounslow West", "Hatton Cross", "Heathrow Terminals 2 & 3", "Heathrow Terminal 5"],

    ["Hatton Cross", "Heathrow Terminal 4", "Heathrow Terminals 2 & 3"],
  ],

  stationAliases: {
    "Kings Cross St. Pancras": "King's Cross St. Pancras",
    "Kings Cross St. P": "King's Cross St. Pancras",
    "Earls Court": "Earl's Court",
    "Heathrow T123": "Heathrow Terminals 2 & 3",
    "Heathrow T123 + 5": "Heathrow Terminals 2 & 3",
  },
});
</script>

<template>
  <div />
</template>
