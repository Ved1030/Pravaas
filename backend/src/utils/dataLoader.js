const western = require("../data/stations/westernLine.json");
const central = require("../data/stations/centralLine.json");
const harbour = require("../data/stations/harbourLine.json");
const metroLine1 = require("../data/stations/metroLine1.json");
const metroLineRed = require("../data/stations/metroLine_red.json");
const metroLineUnderground = require("../data/stations/metroline_underground.json");
const monorailStations = require("../data/stations/monorail.json");

const trainFare = require("../data/fares/trainFare.json");
const busFare = require("../data/fares/busFare.json");
const metroFareLine1 = require("../data/fares/metroFareline1.json");
const metroFareRed = require("../data/fares/metroFareredline2_3.json");
const metroFareUnderground = require("../data/fares/metroFareunderground.json");
const monorailFare = require("../data/fares/monorail.json");

const redLineStations = Array.isArray(metroLineRed) && metroLineRed.length > 0
  ? metroLineRed
  : Object.keys(metroFareRed);

const undergroundStations = metroLineUnderground.stations || [];
const monorailStationList = monorailStations.stations || [];

const transportData = {
  stations: {
    western,
    central,
    harbour,
    metroLine1,
    metroRed: redLineStations,
    metroUnderground: undergroundStations,
    monorail: monorailStationList,
  },
  fares: {
    train: trainFare,
    bus: busFare,
    metroLine1: metroFareLine1,
    metroRed: metroFareRed,
    metroUnderground: metroFareUnderground,
    monorail: monorailFare,
  },
};

module.exports = { transportData };
