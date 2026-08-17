export const cleanTflStationName = (stationName: string) => {
  return stationName
    .replace(/\s+Underground Station$/, "")
    .replace(/\s+Rail Station$/, "")
    .replace(/^London Paddington$/, "Paddington")
    .replace(/^London Liverpool Street$/, "Liverpool Street")
    .replace(/^Stratford \(London\)$/, "Stratford")
    .trim();
};

export const formatArrivalTime = (seconds: number) => {
  if (seconds <= 30) {
    return "Due";
  }

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} min`;
};
