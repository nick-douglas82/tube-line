import { computed, onMounted, onUnmounted } from "vue";
import type { TflPrediction, TflTrain } from "~/types/types";

const tubeLineIds = ["bakerloo", "central", "circle", "district", "elizabeth", "hammersmith-city", "jubilee", "metropolitan", "northern", "piccadilly", "victoria", "waterloo-city"] as const;

const pollingIntervalMilliseconds = 10_000;

let refreshInterval: ReturnType<typeof setInterval> | null = null;
let consumerCount = 0;

const selectCurrentLocation = (predictions: TflPrediction[]): string => {
  const locationCounts = new Map<string, number>();

  predictions.forEach((prediction) => {
    if (!prediction.currentLocation || prediction.currentLocation === "At Platform") {
      return;
    }

    locationCounts.set(prediction.currentLocation, (locationCounts.get(prediction.currentLocation) ?? 0) + 1);
  });

  return [...locationCounts.entries()].sort((firstLocation, secondLocation) => secondLocation[1] - firstLocation[1])[0]?.[0] ?? "";
};

export const useTflTrains = () => {
  const predictions = useState<TflPrediction[]>("tfl-train-predictions", () => []);

  const isRefreshing = useState<boolean>("tfl-train-predictions-refreshing", () => false);

  const trains = computed<TflTrain[]>(() => {
    const predictionsByTrain = new Map<string, TflPrediction[]>();

    predictions.value.forEach((prediction) => {
      if (!prediction.vehicleId) {
        return;
      }

      const trainKey = `${prediction.lineId}:${prediction.vehicleId}`;

      const trainPredictions = predictionsByTrain.get(trainKey) ?? [];

      trainPredictions.push(prediction);

      predictionsByTrain.set(trainKey, trainPredictions);
    });

    return [...predictionsByTrain.values()].flatMap((trainPredictions) => {
      const sortedPredictions = [...trainPredictions].sort((firstPrediction, secondPrediction) => new Date(firstPrediction.expectedArrival).getTime() - new Date(secondPrediction.expectedArrival).getTime());

      const firstPrediction = sortedPredictions[0];

      if (!firstPrediction) {
        return [];
      }

      return [
        {
          vehicleId: firstPrediction.vehicleId,
          lineId: firstPrediction.lineId,
          lineName: firstPrediction.lineName,
          currentLocation: selectCurrentLocation(sortedPredictions),
          towards: firstPrediction.towards,
          destinationName: firstPrediction.destinationName,
          predictions: sortedPredictions,
        },
      ];
    });
  });

  const refresh = async () => {
    if (isRefreshing.value) {
      return;
    }

    isRefreshing.value = true;

    try {
      predictions.value = await $fetch<TflPrediction[]>(`https://api.tfl.gov.uk/Line/${tubeLineIds.join(",")}/Arrivals`);
    } finally {
      isRefreshing.value = false;
    }
  };

  const getLineTrains = (lineId: string) => {
    return computed(() => trains.value.filter((train) => train.lineId === lineId));
  };

  onMounted(() => {
    consumerCount += 1;

    if (predictions.value.length === 0) {
      void refresh();
    }

    if (!refreshInterval) {
      refreshInterval = setInterval(() => {
        void refresh();
      }, pollingIntervalMilliseconds);
    }
  });

  onUnmounted(() => {
    consumerCount -= 1;

    if (consumerCount > 0 || !refreshInterval) {
      return;
    }

    clearInterval(refreshInterval);
    refreshInterval = null;
  });

  return {
    trains,
    isRefreshing,
    refresh,
    getLineTrains,
  };
};
