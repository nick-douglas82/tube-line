export type TflStopPoint = {
  id: string;
  commonName: string;
  lat: number;
  lon: number;
};

export type TubeLineConfig = {
  id: string;
  colour: string;
  routes: ReadonlyArray<ReadonlyArray<string>>;
  stationAliases?: Readonly<Record<string, string>>;
  stationNameSuffixesToRemove?: ReadonlyArray<string>;
};

export type TrainSegment = {
  startStationName: string;
  endStationName: string;
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  expectedArrivalTime: number;
  initialProgress?: number;
};

export type TrainMotion = {
  segmentKey: string;
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  targetArrivalTime: number;
  progress: number;
  progressVelocity: number;
};

export type TransportLine = {
  id: string;
  name: string;
  colour: string;
};

export type TflPrediction = {
  vehicleId: string;
  stationName: string;
  lineId: string;
  lineName: string;
  platformName: string;
  destinationName: string;
  towards: string;
  timeToStation: number;
  currentLocation: string;
  expectedArrival: string;
  timestamp: string;
};

export type TflTrain = {
  vehicleId: string;
  lineId: string;
  lineName: string;
  currentLocation: string;
  towards: string;
  destinationName: string;
  predictions: TflPrediction[];
};
