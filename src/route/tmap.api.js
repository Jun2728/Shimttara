// /src/route/tmap.api.js
import { API } from "../core/config.js";

export async function fetchTmapPedestrianRoute({ startLat, startLng, endLat, endLng, passList = "" }) {
  const res = await fetch(`${API.API_SERVER}/api/tmap/pedestrian`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startLat,
      startLng,
      endLat,
      endLng,
      startName: "출발",
      endName: "도착",
      searchOption: 0,
      passList,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("Tmap route error: " + t);
  }

  return await res.json();
}
