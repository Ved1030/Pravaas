const { transportData } = require("../utils/dataLoader");

function getMetroFare(from, to) {
  if (!from || !to) return 0;

  const normalizedFrom = normalizeStation(from);
  const normalizedTo = normalizeStation(to);

  const line1Fare = lookupMatrix(transportData.fares.metroLine1, normalizedFrom, normalizedTo);
  if (line1Fare !== null) return line1Fare;

  const redFare = lookupMatrix(transportData.fares.metroRed, normalizedFrom, normalizedTo);
  if (redFare !== null) return redFare;

  const undergroundFare = lookupUndergroundSlab(normalizedFrom, normalizedTo);
  if (undergroundFare !== null) return undergroundFare;

  return null;
}

function lookupMatrix(matrix, from, to) {
  if (!matrix || typeof matrix !== "object") return null;

  const fromKey = Object.keys(matrix).find((k) => normalizeStation(k) === from);
  if (fromKey && matrix[fromKey][to] !== undefined) return matrix[fromKey][to];

  for (const key of Object.keys(matrix)) {
    if (matrix[key] && typeof matrix[key] === "object") {
      const toKey = Object.keys(matrix[key]).find((k) => normalizeStation(k) === to);
      if (toKey) return matrix[key][toKey];
    }
  }

  const toKey = Object.keys(matrix).find((k) => normalizeStation(k) === to);
  if (toKey && matrix[toKey] && typeof matrix[toKey] === "object") {
    const fromKey2 = Object.keys(matrix[toKey]).find((k) => normalizeStation(k) === from);
    if (fromKey2) return matrix[toKey][fromKey2];
  }

  return null;
}

function lookupUndergroundSlab(from, to) {
  const stations = transportData.stations.metroUnderground;
  if (!stations || stations.length === 0) return null;

  const fromIdx = stations.findIndex((s) => normalizeStation(s) === from);
  const toIdx = stations.findIndex((s) => normalizeStation(s) === to);
  if (fromIdx === -1 || toIdx === -1) return null;

  const stationCount = Math.abs(toIdx - fromIdx);
  const slabs = transportData.fares.metroUnderground.slabs;
  for (const slab of slabs) {
    if (stationCount <= slab.maxStations) return slab.fare;
  }
  return slabs[slabs.length - 1].fare;
}

function getTrainFare(distanceKm) {
  const slabs = transportData.fares.train.secondClass;
  for (const slab of slabs) {
    if (distanceKm >= slab.minKm && distanceKm <= slab.maxKm) return slab.fare;
  }
  const last = slabs[slabs.length - 1];
  if (distanceKm > last.maxKm) {
    const extraKm = distanceKm - last.maxKm;
    return last.fare + Math.ceil(extraKm / 5) * 5;
  }
  return slabs[0].fare;
}

function getBusFare(distanceKm) {
  const slabs = transportData.fares.bus.slabs;
  for (const slab of slabs) {
    if (distanceKm > slab.min && distanceKm <= slab.max) return slab.fare;
  }
  if (distanceKm <= slabs[0].max) return slabs[0].fare;
  return slabs[slabs.length - 1].fare;
}

function getMonorailFare(from, to) {
  if (!from || !to) return 0;

  const stations = transportData.stations.monorail;
  const fromIdx = stations.findIndex((s) => normalizeStation(s) === normalizeStation(from));
  const toIdx = stations.findIndex((s) => normalizeStation(s) === normalizeStation(to));

  if (fromIdx === -1 || toIdx === -1) return null;

  const stationCount = Math.abs(toIdx - fromIdx);
  const slabs = transportData.fares.monorail.slabs;
  for (const slab of slabs) {
    if (stationCount >= slab.minStations && stationCount <= slab.maxStations) {
      return slab.normalFare;
    }
  }
  return slabs[slabs.length - 1].normalFare;
}

function getAutoFare(distanceKm) {
  const baseDistance = 1.2;
  const baseFare = 26;
  const perKm = 16;

  if (distanceKm <= baseDistance) return baseFare;
  return Math.round(baseFare + (distanceKm - baseDistance) * perKm);
}

function getCabFare(distanceKm, isPeak = false) {
  const base = 50;
  const perKm = 12;
  const surgeMultiplier = isPeak ? 1.4 : 1.0;

  return Math.round((base + distanceKm * perKm) * surgeMultiplier);
}

function normalizeStation(name) {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function findStationIndex(stations, query) {
  const normalized = normalizeStation(query);
  return stations.findIndex((s) => normalizeStation(s) === normalized);
}

module.exports = {
  getMetroFare,
  getTrainFare,
  getBusFare,
  getMonorailFare,
  getAutoFare,
  getCabFare,
  normalizeStation,
  findStationIndex,
};
