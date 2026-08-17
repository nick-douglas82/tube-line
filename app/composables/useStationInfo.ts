import { onMounted, onUnmounted, ref } from "vue";

export type StationLine = {
  id: string;
  name: string;
};

export type StationDetails = {
  id: string;
  commonName: string;
  lines?: StationLine[];
};

export type StationArrival = {
  vehicleId: string;
  lineId: string;
  lineName: string;
  platformName: string;
  destinationName: string;
  timeToStation: number;
  expectedArrival: string;
};

const refreshIntervalMilliseconds = 10_000;

export const useStationInfo = (stationId: string) => {
  const station = ref<StationDetails | null>(null);

  const arrivals = ref<StationArrival[]>([]);

  const isLoading = ref(true);

  const error = ref<string | null>(null);

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  let abortController: AbortController | null = null;

  const refresh = async () => {
    abortController?.abort();

    abortController = new AbortController();

    try {
      error.value = null;

      const [stationResponse, arrivalsResponse] = await Promise.all([
        fetch(`https://api.tfl.gov.uk/StopPoint/${stationId}`, {
          signal: abortController.signal,
        }),

        fetch(`https://api.tfl.gov.uk/StopPoint/${stationId}/Arrivals`, {
          signal: abortController.signal,
        }),
      ]);

      if (!stationResponse.ok || !arrivalsResponse.ok) {
        throw new Error("Unable to load station information");
      }

      station.value = (await stationResponse.json()) as StationDetails;

      const responseArrivals = (await arrivalsResponse.json()) as StationArrival[];

      const seenArrivals = new Set<string>();

      arrivals.value = responseArrivals
        .filter((arrival) => {
          const key = `${arrival.lineId}:` + `${arrival.vehicleId}:` + `${arrival.platformName}:` + `${arrival.expectedArrival}`;

          if (seenArrivals.has(key)) {
            return false;
          }

          seenArrivals.add(key);

          return true;
        })
        .filter((arrival) => arrival.timeToStation >= 0)
        .sort((firstArrival, secondArrival) => firstArrival.timeToStation - secondArrival.timeToStation);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        return;
      }

      error.value = "Unable to load live station information";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    void refresh();

    refreshInterval = setInterval(() => {
      void refresh();
    }, refreshIntervalMilliseconds);
  });

  onUnmounted(() => {
    abortController?.abort();

    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  return {
    station,
    arrivals,
    isLoading,
    error,
    refresh,
  };
};
