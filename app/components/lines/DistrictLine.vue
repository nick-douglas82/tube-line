<script setup lang="ts">
import { useTubeLine } from "~/composables/useTubeLine";

useTubeLine({
  id: "district",
  colour: "#00782A",
  routes: [
    [
      "Upminster",
      "Upminster Bridge",
      "Hornchurch",
      "Elm Park",
      "Dagenham East",
      "Dagenham Heathway",
      "Becontree",
      "Upney",
      "Barking",
      "East Ham",
      "Upton Park",
      "Plaistow",
      "West Ham",
      "Bromley-by-Bow",
      "Bow Road",
      "Mile End",
      "Stepney Green",
      "Whitechapel",
      "Aldgate East",
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
      "Earl's Court",
      "West Kensington",
      "Barons Court",
      "Hammersmith (Dist&Picc Line)",
      "Ravenscourt Park",
      "Stamford Brook",
      "Turnham Green",
    ],

    ["Turnham Green", "Gunnersbury", "Kew Gardens", "Richmond"],

    ["Turnham Green", "Chiswick Park", "Acton Town", "Ealing Common", "Ealing Broadway"],

    ["Earl's Court", "West Brompton", "Fulham Broadway", "Parsons Green", "Putney Bridge", "East Putney", "Southfields", "Wimbledon Park", "Wimbledon"],

    ["Earl's Court", "High Street Kensington", "Notting Hill Gate", "Bayswater", "Paddington", "Edgware Road (Circle Line)"],

    ["Earl's Court", "Kensington (Olympia)"],
  ],

  stationAliases: {
    "Earls Court": "Earl's Court",

    "St James's Park": "St. James's Park",

    "St James Park": "St. James's Park",

    Hammersmith: "Hammersmith (Dist&Picc Line)",

    "Edgware Road": "Edgware Road (Circle Line)",

    "Kensington Olympia": "Kensington (Olympia)",
  },
});
</script>

<template>
  <div />
</template>
