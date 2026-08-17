import { h, inject, onUnmounted, render, watch, type Component, type ShallowRef } from "vue";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import { tubeMapKey } from "~/composables/useTubeMap";
import { useTflTrains } from "~/composables/useTflTrains";
import type { TflPrediction, TflTrain } from "~/types/types";
import TubeStationMarker from "~/components/map/TubeStationMarker.vue";
import TubeTrainMarker from "~/components/map/TubeTrainMarker.vue";
import StationInfoPopup from "~/components/map/info/StationInfoPopup.vue";
import TrainInfoPopup from "~/components/map/info/TrainInfoPopup.vue";

type TflStopPoint = {
  id: string;
  commonName: string;
  lat: number;
  lon: number;
};

type TubeLineConfig = {
  id: string;
  colour: string;
  routes: ReadonlyArray<ReadonlyArray<string>>;
  stationAliases?: Readonly<Record<string, string>>;
  stationNameSuffixesToRemove?: ReadonlyArray<string>;
};

type TrainSegment = {
  startStationName: string;
  endStationName: string;

  startCoordinates: [number, number];

  endCoordinates: [number, number];

  expectedArrivalTime: number;
  initialProgress?: number;
};

type TrainMotion = {
  segmentKey: string;

  startCoordinates: [number, number];

  endCoordinates: [number, number];

  targetArrivalTime: number;
  progress: number;
  progressVelocity: number;
};

const velocitySmoothingSeconds = 4;

const minimumCatchUpSeconds = 6;

const maximumSpeedDegreesPerSecond = 0.001;

const clamp = (value: number, minimum: number, maximum: number) => {
  return Math.min(Math.max(value, minimum), maximum);
};

export const useTubeLine = (config: TubeLineConfig) => {
  const map = inject<ShallowRef<MapLibreMap | null>>(tubeMapKey);

  if (!map) {
    throw new Error(`${config.id} line must be rendered inside TubeMap`);
  }

  const { data: stations } = useFetch<TflStopPoint[]>(`https://api.tfl.gov.uk/Line/${config.id}/StopPoints`);

  const { getLineTrains } = useTflTrains();

  const trains = getLineTrains(config.id);

  const { activeLineId, setHoveredLine, clearHoveredLine } = useLineFilter();

  const { openComponent, updateCoordinates, isOpen, closeKey, close } = useMapInfoPopup();

  const stationMarkers: Marker[] = [];

  const trainMarkers = new Map<string, Marker>();

  const trainMotions = new Map<string, TrainMotion>();

  const sourceId = `${config.id}-line`;

  const layerId = `${config.id}-line`;

  let lineAdded = false;

  let animationFrame: number | null = null;

  let lastAnimationTime: number | null = null;

  const cleanStationName = (stationName: string) => {
    let cleanedStationName = stationName.replace(/\s+Underground Station$/, "").trim();

    config.stationNameSuffixesToRemove?.forEach((suffix) => {
      if (cleanedStationName.endsWith(suffix)) {
        cleanedStationName = cleanedStationName.slice(0, -suffix.length);
      }
    });

    return cleanedStationName.trim();
  };

  const normaliseStationName = (stationName: string) => {
    const cleanedStationName = cleanStationName(stationName);

    return config.stationAliases?.[cleanedStationName] ?? cleanedStationName;
  };

  const findStation = (stationData: TflStopPoint[], stationName: string) => {
    const normalisedStationName = normaliseStationName(stationName);

    return stationData.find((station) => normaliseStationName(station.commonName) === normalisedStationName);
  };

  const getFuturePredictions = (train: TflTrain) => {
    const currentTime = Date.now() - 5_000;

    const futurePredictions = train.predictions.filter((prediction) => {
      const expectedArrivalTime = new Date(prediction.expectedArrival).getTime();

      return !Number.isNaN(expectedArrivalTime) && expectedArrivalTime >= currentTime;
    });

    return futurePredictions.length > 0 ? futurePredictions : train.predictions;
  };

  const getDistinctFuturePredictions = (train: TflTrain) => {
    const seenStations = new Set<string>();

    return getFuturePredictions(train).filter((prediction) => {
      const stationName = normaliseStationName(prediction.stationName);

      if (seenStations.has(stationName)) {
        return false;
      }

      seenStations.add(stationName);

      return true;
    });
  };

  const getPredictionForStation = (train: TflTrain, stationName: string): TflPrediction | null => {
    const normalisedStationName = normaliseStationName(stationName);

    return getFuturePredictions(train).find((prediction) => normaliseStationName(prediction.stationName) === normalisedStationName) ?? null;
  };

  const getFirstFutureStationName = (train: TflTrain, excludedStationName?: string) => {
    const excludedNormalisedStationName = excludedStationName ? normaliseStationName(excludedStationName) : null;

    const prediction = getFuturePredictions(train).find((futurePrediction) => {
      const stationName = normaliseStationName(futurePrediction.stationName);

      return !excludedNormalisedStationName || stationName !== excludedNormalisedStationName;
    });

    if (!prediction) {
      return null;
    }

    return normaliseStationName(prediction.stationName);
  };

  const getAdjacentStations = (stationName: string) => {
    const normalisedStationName = normaliseStationName(stationName);

    const adjacentStations = new Set<string>();

    config.routes.forEach((route) => {
      const normalisedRoute = route.map(normaliseStationName);

      normalisedRoute.forEach((routeStationName, stationIndex) => {
        if (routeStationName !== normalisedStationName) {
          return;
        }

        const previousStation = normalisedRoute[stationIndex - 1];

        const nextStation = normalisedRoute[stationIndex + 1];

        if (previousStation) {
          adjacentStations.add(previousStation);
        }

        if (nextStation) {
          adjacentStations.add(nextStation);
        }
      });
    });

    return [...adjacentStations];
  };

  const findRoutePath = (fromStationName: string, toStationName: string): string[] | null => {
    const start = normaliseStationName(fromStationName);

    const destination = normaliseStationName(toStationName);

    if (start === destination) {
      return [start];
    }

    const queue: string[][] = [[start]];

    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const path = queue.shift();

      if (!path) {
        continue;
      }

      const currentStation = path[path.length - 1];

      if (!currentStation) {
        continue;
      }

      const adjacentStations = getAdjacentStations(currentStation);

      for (const adjacentStation of adjacentStations) {
        if (visited.has(adjacentStation)) {
          continue;
        }

        const nextPath = [...path, adjacentStation];

        if (adjacentStation === destination) {
          return nextPath;
        }

        visited.add(adjacentStation);

        queue.push(nextPath);
      }
    }

    return null;
  };

  const getCoordinates = (stationData: TflStopPoint[], stationName: string): [number, number] | null => {
    const station = findStation(stationData, stationName);

    if (!station) {
      return null;
    }

    return [station.lon, station.lat];
  };

  const getDistance = (start: [number, number], end: [number, number]) => {
    return Math.hypot(end[0] - start[0], end[1] - start[1]);
  };

  const getPathDistance = (stationData: TflStopPoint[], path: string[]) => {
    let distance = 0;

    for (let index = 0; index < path.length - 1; index += 1) {
      const startName = path[index];

      const endName = path[index + 1];

      if (!startName || !endName) {
        continue;
      }

      const start = getCoordinates(stationData, startName);

      const end = getCoordinates(stationData, endName);

      if (!start || !end) {
        continue;
      }

      distance += getDistance(start, end);
    }

    return distance;
  };

  const parseExpectedArrivalTime = (expectedArrival?: string) => {
    if (!expectedArrival) {
      return Date.now() + 15_000;
    }

    const expectedArrivalTime = new Date(expectedArrival).getTime();

    if (Number.isNaN(expectedArrivalTime)) {
      return Date.now() + 15_000;
    }

    return expectedArrivalTime;
  };

  const getPredictionSeconds = (prediction: TflPrediction) => {
    if (Number.isFinite(prediction.timeToStation)) {
      return Math.max(prediction.timeToStation, 0);
    }

    return Math.max((parseExpectedArrivalTime(prediction.expectedArrival) - Date.now()) / 1000, 0);
  };

  const createSegment = (train: TflTrain, stationData: TflStopPoint[], startStationName: string, endStationName: string, initialProgress = 0, expectedArrival?: string): TrainSegment | null => {
    const startStation = findStation(stationData, startStationName);

    const endStation = findStation(stationData, endStationName);

    if (!startStation || !endStation) {
      return null;
    }

    const prediction = expectedArrival ? null : getPredictionForStation(train, endStationName);

    return {
      startStationName: normaliseStationName(startStationName),

      endStationName: normaliseStationName(endStationName),

      startCoordinates: [startStation.lon, startStation.lat],

      endCoordinates: [endStation.lon, endStation.lat],

      expectedArrivalTime: parseExpectedArrivalTime(expectedArrival ?? prediction?.expectedArrival),

      initialProgress: clamp(initialProgress, 0, 0.98),
    };
  };

  const createStationarySegment = (stationData: TflStopPoint[], prediction: TflPrediction): TrainSegment | null => {
    const stationName = normaliseStationName(prediction.stationName);

    const coordinates = getCoordinates(stationData, stationName);

    if (!coordinates) {
      return null;
    }

    return {
      startStationName: stationName,

      endStationName: stationName,

      startCoordinates: coordinates,

      endCoordinates: coordinates,

      expectedArrivalTime: parseExpectedArrivalTime(prediction.expectedArrival),

      initialProgress: 1,
    };
  };

  const getPreviousStation = (firstStationName: string, secondStationName: string, existingMotion?: TrainMotion) => {
    const firstStation = normaliseStationName(firstStationName);

    const secondStation = normaliseStationName(secondStationName);

    const pathForward = findRoutePath(firstStation, secondStation);

    const nextStation = pathForward?.[1];

    if (!nextStation) {
      return null;
    }

    if (existingMotion && existingMotion.segmentKey.endsWith(`>${firstStation}`)) {
      const previous = existingMotion.segmentKey.split(">")[0];

      if (previous) {
        return previous;
      }
    }

    for (const route of config.routes) {
      const normalisedRoute = route.map(normaliseStationName);

      const firstIndex = normalisedRoute.indexOf(firstStation);

      const secondIndex = normalisedRoute.indexOf(secondStation);

      if (firstIndex === -1 || secondIndex === -1 || firstIndex === secondIndex) {
        continue;
      }

      const previousIndex = secondIndex > firstIndex ? firstIndex - 1 : firstIndex + 1;

      const previousStation = normalisedRoute[previousIndex];

      if (previousStation && previousStation !== nextStation) {
        return previousStation;
      }
    }

    const previousCandidates = getAdjacentStations(firstStation).filter((station) => station !== nextStation);

    if (previousCandidates.length === 1) {
      return previousCandidates[0] ?? null;
    }

    return null;
  };

  const getPredictionBasedSegment = (train: TflTrain, stationData: TflStopPoint[], existingMotion?: TrainMotion): TrainSegment | null => {
    const predictions = getDistinctFuturePredictions(train);

    const firstPrediction = predictions[0];

    const secondPrediction = predictions[1];

    if (!firstPrediction) {
      return null;
    }

    if (!secondPrediction) {
      return createStationarySegment(stationData, firstPrediction);
    }

    const firstStationName = normaliseStationName(firstPrediction.stationName);

    const secondStationName = normaliseStationName(secondPrediction.stationName);

    const previousStationName = getPreviousStation(firstStationName, secondStationName, existingMotion);

    if (!previousStationName) {
      return createStationarySegment(stationData, firstPrediction);
    }

    const previousCoordinates = getCoordinates(stationData, previousStationName);

    const firstCoordinates = getCoordinates(stationData, firstStationName);

    if (!previousCoordinates || !firstCoordinates) {
      return null;
    }

    const forwardPath = findRoutePath(firstStationName, secondStationName);

    if (!forwardPath || forwardPath.length < 2) {
      return null;
    }

    const previousSegmentDistance = getDistance(previousCoordinates, firstCoordinates);

    const forwardPathDistance = getPathDistance(stationData, forwardPath);

    const firstPredictionSeconds = getPredictionSeconds(firstPrediction);

    const secondPredictionSeconds = getPredictionSeconds(secondPrediction);

    const forwardTravelSeconds = Math.max(secondPredictionSeconds - firstPredictionSeconds, 30);

    let estimatedPreviousSegmentSeconds = forwardTravelSeconds;

    if (previousSegmentDistance > 0 && forwardPathDistance > 0) {
      estimatedPreviousSegmentSeconds = forwardTravelSeconds * (previousSegmentDistance / forwardPathDistance);
    }

    estimatedPreviousSegmentSeconds = clamp(estimatedPreviousSegmentSeconds, 30, 900);

    const initialProgress = clamp(1 - firstPredictionSeconds / estimatedPreviousSegmentSeconds, 0, 0.98);

    return createSegment(train, stationData, previousStationName, firstStationName, initialProgress, firstPrediction.expectedArrival);
  };

  const getBetweenSegment = (train: TflTrain, stationData: TflStopPoint[], firstStationName: string, secondStationName: string): TrainSegment | null => {
    const firstPrediction = getPredictionForStation(train, firstStationName);

    const secondPrediction = getPredictionForStation(train, secondStationName);

    if (firstPrediction && !secondPrediction) {
      return createSegment(train, stationData, secondStationName, firstStationName);
    }

    if (secondPrediction && !firstPrediction) {
      return createSegment(train, stationData, firstStationName, secondStationName);
    }

    if (firstPrediction && secondPrediction) {
      const firstArrival = new Date(firstPrediction.expectedArrival).getTime();

      const secondArrival = new Date(secondPrediction.expectedArrival).getTime();

      if (firstArrival < secondArrival) {
        return createSegment(train, stationData, secondStationName, firstStationName);
      }

      return createSegment(train, stationData, firstStationName, secondStationName);
    }

    const futureStationName = getFirstFutureStationName(train);

    if (!futureStationName) {
      return null;
    }

    const firstPath = findRoutePath(firstStationName, futureStationName);

    const secondPath = findRoutePath(secondStationName, futureStationName);

    if (firstPath && secondPath) {
      if (firstPath.length < secondPath.length) {
        return createSegment(train, stationData, secondStationName, firstStationName);
      }

      return createSegment(train, stationData, firstStationName, secondStationName);
    }

    return null;
  };

  const getTrainSegment = (train: TflTrain, stationData: TflStopPoint[], existingMotion?: TrainMotion): TrainSegment | null => {
    const currentLocation = train.currentLocation.trim();

    if (!currentLocation) {
      return getPredictionBasedSegment(train, stationData, existingMotion);
    }

    const betweenMatch = currentLocation.match(/^Between (.+) and (.+)$/);

    if (betweenMatch?.[1] && betweenMatch[2]) {
      return getBetweenSegment(train, stationData, betweenMatch[1], betweenMatch[2]);
    }

    const approachingMatch = currentLocation.match(/^Approaching (.+?)(?: Platform \d+)?$/);

    if (approachingMatch?.[1]) {
      const stationName = normaliseStationName(approachingMatch[1]);

      if (existingMotion && existingMotion.segmentKey.endsWith(`>${stationName}`)) {
        const startStationName = existingMotion.segmentKey.split(">")[0];

        if (startStationName) {
          return createSegment(train, stationData, startStationName, stationName);
        }
      }

      const station = findStation(stationData, stationName);

      if (!station) {
        return null;
      }

      return {
        startStationName: stationName,

        endStationName: stationName,

        startCoordinates: [station.lon, station.lat],

        endCoordinates: [station.lon, station.lat],

        expectedArrivalTime: parseExpectedArrivalTime(getPredictionForStation(train, stationName)?.expectedArrival),

        initialProgress: 1,
      };
    }

    const stationMatch = currentLocation.match(/^(?:At|Departed) (.+?)(?: Platform \d+)?$/);

    if (stationMatch?.[1] && stationMatch[1] !== "Platform") {
      const currentStationName = normaliseStationName(stationMatch[1]);

      const futureStationName = getFirstFutureStationName(train, currentStationName);

      if (!futureStationName) {
        return null;
      }

      const path = findRoutePath(currentStationName, futureStationName);

      const nextStationName = path?.[1];

      if (!nextStationName) {
        return null;
      }

      return createSegment(train, stationData, currentStationName, nextStationName);
    }

    return null;
  };

  const getCoordinatesAtProgress = (segment: TrainSegment): [number, number] => {
    const progress = segment.initialProgress ?? 0;

    return [segment.startCoordinates[0] + (segment.endCoordinates[0] - segment.startCoordinates[0]) * progress, segment.startCoordinates[1] + (segment.endCoordinates[1] - segment.startCoordinates[1]) * progress];
  };

  const getInitialCoordinates = (train: TflTrain, stationData: TflStopPoint[]): [number, number] | null => {
    const currentLocation = train.currentLocation.trim();

    if (!currentLocation) {
      const segment = getPredictionBasedSegment(train, stationData);

      if (segment) {
        return getCoordinatesAtProgress(segment);
      }
    }

    const betweenMatch = currentLocation.match(/^Between (.+) and (.+)$/);

    if (betweenMatch?.[1] && betweenMatch[2]) {
      const firstStation = findStation(stationData, betweenMatch[1]);

      const secondStation = findStation(stationData, betweenMatch[2]);

      if (firstStation && secondStation) {
        return [(firstStation.lon + secondStation.lon) / 2, (firstStation.lat + secondStation.lat) / 2];
      }
    }

    const stationMatch = currentLocation.match(/^(?:At|Approaching|Departed) (.+?)(?: Platform \d+)?$/);

    if (stationMatch?.[1] && stationMatch[1] !== "Platform") {
      const station = findStation(stationData, stationMatch[1]);

      if (station) {
        return [station.lon, station.lat];
      }
    }

    const firstPrediction = getDistinctFuturePredictions(train)[0];

    if (!firstPrediction) {
      return null;
    }

    return getCoordinates(stationData, firstPrediction.stationName);
  };

  const createMarkerElement = (component: Component) => {
    const element = document.createElement("div");

    render(
      h(component, {
        colour: config.colour,
      }),
      element,
    );

    return element;
  };

  const removeMarker = (marker: Marker) => {
    render(null, marker.getElement());

    marker.remove();
  };

  const getSegmentKey = (segment: TrainSegment) => {
    return `${segment.startStationName}>${segment.endStationName}`;
  };

  const setMarkerFilterState = (marker: Marker, isActive: boolean) => {
    const visual = marker.getElement().querySelector<HTMLElement | SVGElement>("[data-line-visual]");

    if (!visual) {
      return;
    }

    visual.style.opacity = isActive ? "1" : "0.2";

    visual.style.filter = isActive ? "none" : "grayscale(1)";
  };

  const applyFilterState = () => {
    const mapInstance = map.value;

    if (!mapInstance) {
      return;
    }

    const isActive = !activeLineId.value || activeLineId.value === config.id;

    if (mapInstance.getLayer(layerId)) {
      mapInstance.setPaintProperty(layerId, "line-color", isActive ? config.colour : "#4B5563");

      mapInstance.setPaintProperty(layerId, "line-opacity", isActive ? 1 : 0.2);
    }

    stationMarkers.forEach((marker) => {
      setMarkerFilterState(marker, isActive);
    });

    trainMarkers.forEach((marker) => {
      setMarkerFilterState(marker, isActive);
    });
  };

  const trainPopupKey = (vehicleId: string) => {
    return `train:${config.id}:${vehicleId}`;
  };

  const stationPopupKey = (stationId: string) => {
    return `station:${stationId}`;
  };

  const getTrainDestination = (train: TflTrain) => {
    if (train.towards.trim()) {
      return train.towards;
    }

    return train.destinationName || "Unknown destination";
  };

  const getTrainLocationLabel = (train: TflTrain) => {
    if (train.currentLocation.trim()) {
      return train.currentLocation;
    }

    const firstPrediction = getDistinctFuturePredictions(train)[0];

    if (!firstPrediction) {
      return "Location unavailable";
    }

    return `Approaching ${normaliseStationName(firstPrediction.stationName)}`;
  };

  const openStationInfo = (mapInstance: MapLibreMap, station: TflStopPoint) => {
    openComponent({
      key: stationPopupKey(station.id),

      map: mapInstance,

      coordinates: [station.lon, station.lat],

      component: StationInfoPopup,

      props: {
        stationId: station.id,

        fallbackName: cleanStationName(station.commonName),
      },
    });
  };

  const openTrainInfo = (mapInstance: MapLibreMap, train: TflTrain) => {
    const marker = trainMarkers.get(train.vehicleId);

    if (!marker) {
      return;
    }

    const position = marker.getLngLat();

    openComponent({
      key: trainPopupKey(train.vehicleId),

      map: mapInstance,

      coordinates: [position.lng, position.lat],

      component: TrainInfoPopup,

      props: {
        vehicleId: train.vehicleId,

        lineId: train.lineId,

        lineName: train.lineName,

        colour: config.colour,

        destinationName: getTrainDestination(train),

        currentLocation: getTrainLocationLabel(train),

        predictions: train.predictions,
      },
    });
  };

  const updateTrainMotion = (vehicleId: string, marker: Marker, segment: TrainSegment) => {
    const segmentKey = getSegmentKey(segment);

    const existingMotion = trainMotions.get(vehicleId);

    if (existingMotion && existingMotion.segmentKey === segmentKey) {
      existingMotion.targetArrivalTime = segment.expectedArrivalTime;

      return;
    }

    const initialProgress = segment.initialProgress ?? 0;

    const initialCoordinates = getCoordinatesAtProgress(segment);

    if (existingMotion) {
      marker.setLngLat(initialCoordinates);

      updateCoordinates(trainPopupKey(vehicleId), initialCoordinates);
    }

    trainMotions.set(vehicleId, {
      segmentKey,

      startCoordinates: segment.startCoordinates,

      endCoordinates: segment.endCoordinates,

      targetArrivalTime: segment.expectedArrivalTime,

      progress: initialProgress,

      progressVelocity: 0,
    });
  };

  const runAnimation = (currentAnimationTime: number) => {
    if (lastAnimationTime === null) {
      lastAnimationTime = currentAnimationTime;
    }

    const deltaSeconds = Math.min((currentAnimationTime - lastAnimationTime) / 1000, 0.1);

    lastAnimationTime = currentAnimationTime;

    const currentTime = Date.now();

    trainMotions.forEach((motion, vehicleId) => {
      const marker = trainMarkers.get(vehicleId);

      if (!marker) {
        return;
      }

      const longitudeDistance = motion.endCoordinates[0] - motion.startCoordinates[0];

      const latitudeDistance = motion.endCoordinates[1] - motion.startCoordinates[1];

      const segmentLength = Math.hypot(longitudeDistance, latitudeDistance);

      if (segmentLength < 0.000001) {
        marker.setLngLat(motion.endCoordinates);

        updateCoordinates(trainPopupKey(vehicleId), motion.endCoordinates);

        motion.progress = 1;

        motion.progressVelocity = 0;

        return;
      }

      const secondsUntilArrival = Math.max((motion.targetArrivalTime - currentTime) / 1000, minimumCatchUpSeconds);

      let desiredProgressVelocity = (1 - motion.progress) / secondsUntilArrival;

      const desiredSpeed = desiredProgressVelocity * segmentLength;

      if (desiredSpeed > maximumSpeedDegreesPerSecond) {
        desiredProgressVelocity = maximumSpeedDegreesPerSecond / segmentLength;
      }

      const smoothingFactor = 1 - Math.exp(-deltaSeconds / velocitySmoothingSeconds);

      motion.progressVelocity += (desiredProgressVelocity - motion.progressVelocity) * smoothingFactor;

      motion.progress = Math.min(motion.progress + motion.progressVelocity * deltaSeconds, 1);

      const longitude = motion.startCoordinates[0] + longitudeDistance * motion.progress;

      const latitude = motion.startCoordinates[1] + latitudeDistance * motion.progress;

      const coordinates: [number, number] = [longitude, latitude];

      marker.setLngLat(coordinates);

      updateCoordinates(trainPopupKey(vehicleId), coordinates);
    });

    animationFrame = requestAnimationFrame(runAnimation);
  };

  const startAnimation = () => {
    if (animationFrame !== null) {
      return;
    }

    animationFrame = requestAnimationFrame(runAnimation);
  };

  const updateTrainMarkers = (mapInstance: MapLibreMap) => {
    const stationData = stations.value;

    if (!stationData) {
      return;
    }

    const activeVehicleIds = new Set(trains.value.map((train) => train.vehicleId));

    trains.value.forEach((train) => {
      const existingMarker = trainMarkers.get(train.vehicleId);

      const existingMotion = trainMotions.get(train.vehicleId);

      const segment = getTrainSegment(train, stationData, existingMotion);

      if (existingMarker) {
        if (segment) {
          updateTrainMotion(train.vehicleId, existingMarker, segment);
        }

        if (isOpen(trainPopupKey(train.vehicleId))) {
          openTrainInfo(mapInstance, train);
        }

        return;
      }

      const initialCoordinates = getInitialCoordinates(train, stationData);

      if (!initialCoordinates) {
        return;
      }

      const element = createMarkerElement(TubeTrainMarker);

      const marker = new Marker({
        element,
      })
        .setLngLat(initialCoordinates)
        .addTo(mapInstance);

      element.addEventListener("mouseenter", () => {
        setHoveredLine(config.id);
      });

      element.addEventListener("mouseleave", () => {
        clearHoveredLine(config.id);
      });

      element.addEventListener("click", (event) => {
        event.stopPropagation();

        const latestTrain = trains.value.find((currentTrain) => currentTrain.vehicleId === train.vehicleId);

        if (!latestTrain) {
          return;
        }

        openTrainInfo(mapInstance, latestTrain);
      });

      trainMarkers.set(train.vehicleId, marker);

      if (segment) {
        updateTrainMotion(train.vehicleId, marker, segment);
      }
    });

    trainMarkers.forEach((marker, vehicleId) => {
      if (activeVehicleIds.has(vehicleId)) {
        return;
      }

      closeKey(trainPopupKey(vehicleId));

      removeMarker(marker);

      trainMarkers.delete(vehicleId);

      trainMotions.delete(vehicleId);
    });

    startAnimation();

    applyFilterState();
  };

  const handleLineMouseEnter = () => {
    setHoveredLine(config.id);

    if (map.value) {
      map.value.getCanvas().style.cursor = "pointer";
    }
  };

  const handleLineMouseLeave = () => {
    clearHoveredLine(config.id);

    if (map.value) {
      map.value.getCanvas().style.cursor = "";
    }
  };

  const addTubeLine = (mapInstance: MapLibreMap) => {
    if (lineAdded) {
      updateTrainMarkers(mapInstance);

      return;
    }

    const stationData = stations.value;

    if (!stationData) {
      return;
    }

    stationData.forEach((station) => {
      const element = createMarkerElement(TubeStationMarker);

      const marker = new Marker({
        element,
      })
        .setLngLat([station.lon, station.lat])
        .addTo(mapInstance);

      element.addEventListener("click", (event) => {
        event.stopPropagation();

        openStationInfo(mapInstance, station);
      });

      stationMarkers.push(marker);
    });

    const routeCoordinates = config.routes
      .map((route) =>
        route
          .map((stationName) => {
            const station = findStation(stationData, stationName);

            if (!station) {
              return null;
            }

            return [station.lon, station.lat] as [number, number];
          })
          .filter((coordinates): coordinates is [number, number] => coordinates !== null),
      )
      .filter((route) => route.length > 1);

    mapInstance.addSource(sourceId, {
      type: "geojson",

      data: {
        type: "Feature",

        properties: {},

        geometry: {
          type: "MultiLineString",

          coordinates: routeCoordinates,
        },
      },
    });

    mapInstance.addLayer({
      id: layerId,

      type: "line",

      source: sourceId,

      paint: {
        "line-color": config.colour,

        "line-width": 6,
      },
    });

    /*
     * Route hover.
     *
     * MapLibre emits these only when the
     * pointer is actually over this layer.
     */
    mapInstance.on("mouseenter", layerId, handleLineMouseEnter);

    mapInstance.on("mouseleave", layerId, handleLineMouseLeave);

    lineAdded = true;

    updateTrainMarkers(mapInstance);

    applyFilterState();
  };

  const initialise = (mapInstance: MapLibreMap) => {
    if (mapInstance.loaded()) {
      addTubeLine(mapInstance);

      return;
    }

    mapInstance.once("load", () => {
      addTubeLine(mapInstance);
    });
  };

  watch(
    map,
    (mapInstance) => {
      if (!mapInstance) {
        return;
      }

      initialise(mapInstance);
    },
    {
      immediate: true,
    },
  );

  watch(stations, () => {
    if (!map.value || lineAdded) {
      return;
    }

    addTubeLine(map.value);
  });

  watch(trains, () => {
    if (!map.value || !lineAdded) {
      return;
    }

    updateTrainMarkers(map.value);
  });

  /*
   * Both URL filtering and hover flow
   * through activeLineId.
   */
  watch(
    activeLineId,
    () => {
      applyFilterState();
    },
    {
      immediate: true,
    },
  );

  onUnmounted(() => {
    clearHoveredLine(config.id);

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = null;

    lastAnimationTime = null;

    close();

    stationMarkers.forEach((marker) => {
      removeMarker(marker);
    });

    trainMarkers.forEach((marker) => {
      removeMarker(marker);
    });

    trainMarkers.clear();
    trainMotions.clear();

    if (!map.value) {
      return;
    }

    /*
     * Remove hover listeners before
     * removing the layer.
     */
    if (map.value.getLayer(layerId)) {
      map.value.off("mouseenter", layerId, handleLineMouseEnter);

      map.value.off("mouseleave", layerId, handleLineMouseLeave);

      map.value.removeLayer(layerId);
    }

    if (map.value.getSource(sourceId)) {
      map.value.removeSource(sourceId);
    }
  });
};
