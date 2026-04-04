const OSRM_BASE = "http://router.project-osrm.org/route/v1";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

const MUMBAI_COORDS = {
  "andheri": { lat: 19.1136, lng: 72.8697 },
  "andheri east": { lat: 19.1130, lng: 72.8740 },
  "andheri west": { lat: 19.1353, lng: 72.8340 },
  "ghatkopar": { lat: 19.0807, lng: 72.9085 },
  "ghatkopar east": { lat: 19.0798, lng: 72.9112 },
  "ghatkopar west": { lat: 19.0867, lng: 72.9050 },
  "bkc": { lat: 19.0650, lng: 72.8680 },
  "bandra": { lat: 19.0596, lng: 72.8295 },
  "bandra east": { lat: 19.0620, lng: 72.8420 },
  "bandra west": { lat: 19.0544, lng: 72.8304 },
  "borivali": { lat: 19.2307, lng: 72.8567 },
  "dadar": { lat: 19.0178, lng: 72.8478 },
  "thane": { lat: 19.2183, lng: 72.9781 },
  "powai": { lat: 19.1176, lng: 72.9060 },
  "worli": { lat: 19.0130, lng: 72.8170 },
  "colaba": { lat: 18.9067, lng: 72.8147 },
  "churchgate": { lat: 18.9322, lng: 72.8264 },
  "csmt": { lat: 18.9398, lng: 72.8354 },
  "kurla": { lat: 19.0728, lng: 72.8826 },
  "santacruz": { lat: 19.0825, lng: 72.8410 },
  "vile parle": { lat: 19.0980, lng: 72.8460 },
  "juhu": { lat: 19.0990, lng: 72.8265 },
  "lower parel": { lat: 19.0050, lng: 72.8220 },
  "malad": { lat: 19.1864, lng: 72.8483 },
  "goregaon": { lat: 19.1630, lng: 72.8520 },
  "kanjurmarg": { lat: 19.1360, lng: 72.9320 },
  "vikroli": { lat: 19.1090, lng: 72.9240 },
  "bhandup": { lat: 19.1480, lng: 72.9360 },
  "mulund": { lat: 19.1720, lng: 72.9560 },
  "chembur": { lat: 19.0630, lng: 72.8990 },
  "navi mumbai": { lat: 19.0330, lng: 73.0297 },
  "vashi": { lat: 19.0730, lng: 73.0020 },
  "aarey": { lat: 19.1560, lng: 72.8830 },
  "marol": { lat: 19.1100, lng: 72.8830 },
  "saki naka": { lat: 19.0930, lng: 72.8870 },
  "jogeshwari": { lat: 19.1360, lng: 72.8500 },
  "dahanukarwadi": { lat: 19.1450, lng: 72.8390 },
  "western express highway": { lat: 19.1100, lng: 72.8680 },
  "eastern express highway": { lat: 19.0800, lng: 72.9100 },
};

async function geocode(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (MUMBAI_COORDS[normalizedQuery]) {
    console.log(`Geocode cache hit: "${query}" →`, MUMBAI_COORDS[normalizedQuery]);
    return MUMBAI_COORDS[normalizedQuery];
  }

  for (const [key, coords] of Object.entries(MUMBAI_COORDS)) {
    if (normalizedQuery.includes(key)) {
      console.log(`Geocode partial match: "${query}" → "${key}" →`, coords);
      return coords;
    }
  }

  try {
    const url = `${NOMINATIM_BASE}?format=json&limit=1&q=${encodeURIComponent(query + ", Mumbai, India")}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "flowcity-smart-commute/1.0",
        "Accept": "application/json",
      },
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Geocode raw response:", text);
      throw new Error(`Geocoding failed: ${text.substring(0, 100)}`);
    }
    if (!data.length) throw new Error(`Location not found: "${query}"`);
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    if (err.message.startsWith("Location not found") || err.message.startsWith("Geocoding failed")) {
      throw err;
    }
    console.warn("Nominatim failed, using fallback for:", query);
    return { lat: 19.0760, lng: 72.8777 };
  }
}

/**
 * Generate logical resource mix based on route type.
 * This is NOT navigation — it shows transport composition.
 */
function generateResources(type, durationMin, distanceKm) {
  if (type === "fastest") {
    const walkTo = Math.max(2, Math.round(durationMin * 0.08));
    const metro = Math.round(durationMin * 0.75);
    const walkFrom = Math.max(2, durationMin - walkTo - metro);
    return [
      { type: "walk", duration: walkTo, label: "Walk to station" },
      { type: "metro", duration: metro, label: "Metro" },
      { type: "walk", duration: walkFrom, label: "Walk to destination" },
    ];
  }

  if (type === "cheapest") {
    const walkTo = Math.max(3, Math.round(durationMin * 0.08));
    const bus = Math.round(durationMin * 0.40);
    const train = Math.round(durationMin * 0.35);
    const walkFrom = Math.max(3, durationMin - walkTo - bus - train);
    return [
      { type: "walk", duration: walkTo, label: "Walk to bus stop" },
      { type: "bus", duration: bus, label: "Bus" },
      { type: "train", duration: train, label: "Local train" },
      { type: "walk", duration: walkFrom, label: "Walk to destination" },
    ];
  }

  // comfort
  return [
    { type: "cab", duration: durationMin, label: "Direct cab ride" },
  ];
}

/**
 * Fetch ALL real OSRM routes with alternatives.
 * Returns ONLY geometry + metrics + resource composition.
 */
async function fetchOSRMRoutes(origin, destination, profile = "driving") {
  const { lat: oLat, lng: oLng } = typeof origin === "object" ? origin : await geocode(origin);
  const { lat: dLat, lng: dLng } = typeof destination === "object" ? destination : await geocode(destination);

  const url = `${OSRM_BASE}/${profile}/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true`;
  console.log("OSRM URL:", url);
  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== "Ok" || !json.routes || !json.routes.length) {
    throw new Error(`OSRM returned no route for ${profile}: ${json.code}`);
  }

  console.log(`OSRM returned ${json.routes.length} real route(s)`);

  const typeLabels = ["fastest", "cheapest", "comfort"];

  return json.routes.map((route, index) => {
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distanceKm = route.distance / 1000;
    const durationMin = Math.round(route.duration / 60);
    const type = typeLabels[index] || "comfort";

    return {
      id: type,
      type,
      label: type === "fastest" ? "Fastest" : type === "cheapest" ? "Cheapest" : "Comfort",
      geometry,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin,
      estimatedCost: type === "cheapest"
        ? Math.round(10 + distanceKm * 0.8)
        : type === "comfort"
          ? Math.round(80 + distanceKm * 9)
          : Math.round(40 + distanceKm * 2.5),
      trafficLevel: distanceKm < 5 ? "low" : distanceKm <= 10 ? "medium" : "high",
      predictedDelay: (() => {
        const hour = new Date().getHours();
        const m = (hour >= 8 && hour <= 11) ? 0.20 : (hour >= 17 && hour <= 21) ? 0.25 : 0;
        return Math.round(durationMin * m);
      })(),
      transfers: type === "comfort" ? 0 : type === "cheapest" ? 2 : 1,
      tags: type === "fastest" ? ["Fastest Route"] : type === "cheapest" ? ["Budget Friendly"] : ["Smooth Ride"],
      resources: generateResources(type, durationMin, distanceKm),
    };
  });
}

exports.geocode = geocode;
exports.fetchOSRMRoutes = fetchOSRMRoutes;
