// /src/core/utils.js
import { state } from "./state.js";
import { DEMO_TEMP } from "./config.js";

export function toLatLng(lat, lng) {
  return new naver.maps.LatLng(lat, lng);
}
export function safeText(v) {
  return (v ?? "").toString();
}
export function escapeHtml(str) {
  return safeText(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
export function setPill(el, text) {
  if (!el) return;
  el.textContent = text;
}

export function getModeLabel() {
  if (state.ROUTE_MODE === "COLD") return "한파모드";
  if (state.ROUTE_MODE === "HEAT") return "무더위모드";
  return "일반모드";
}

export function makeTagMarker({ bg, text }) {
  return {
    content: `
      <div style="
        transform: translate(-50%, -118%);
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding: 6px 10px;
        border-radius: 999px;
        background: ${bg};
        border: 2px solid #fff;
        box-shadow: 0 8px 14px rgba(0,0,0,0.18);
        font-weight: 900;
        font-size: 12px;
        color: #fff;
        letter-spacing: -0.2px;
        white-space: nowrap;
        user-select: none;
      ">${text}</div>
    `,
    size: { width: 1, height: 1 },
    anchor: { x: 0, y: 0 },
  };
}

export const ICONS = {
  START_ICON: makeTagMarker({ bg: "#2DB400", text: "출발" }),
  END_ICON: makeTagMarker({ bg: "#ef4444", text: "도착" }),
  MY_ICON: makeTagMarker({ bg: "#111827", text: "내 위치" }),
};

export function makeShelterChip(type) {
  const isSmart = type === "SMART";
  if (isSmart) return makeTagMarker({ bg: "#16a34a", text: "스마트" });

  const isHeat = state.ROUTE_MODE === "HEAT";
  return makeTagMarker({
    bg: isHeat ? "#f97316" : "#2563eb",
    text: isHeat ? "무더위" : "한파",
  });
}

export function normalizeShelterType(t) {
  const v = safeText(t).trim().toUpperCase();
  if (v === "SMART" || v.includes("SMART")) return "SMART";
  if (v.includes("스마트")) return "SMART";
  if (v === "SHELTER" || v.includes("SHELTER")) return "SHELTER";
  if (v.includes("한파") || v.includes("무더위") || v.includes("쉼터")) return "SHELTER";
  return "UNKNOWN";
}

export function isColdModePassable(s) {
  const t = normalizeShelterType(s?.type);
  return t === "SMART" || t === "SHELTER";
}

export function getDemoTempC() {
  if (state.ROUTE_MODE === "COLD") return DEMO_TEMP.COLD;
  if (state.ROUTE_MODE === "HEAT") return DEMO_TEMP.HEAT;
  return DEMO_TEMP.NORMAL;
}

export function getFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

// Haversine(대략 거리 m)
export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = a.lat,
    lon1 = a.lng;
  const lat2 = b.lat,
    lon2 = b.lng;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const aa = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(aa));
}

export function detourScore(start, end, p) {
  const dSE = haversineMeters(start, end);
  const dSP = haversineMeters(start, p);
  const dPE = haversineMeters(p, end);
  return dSP + dPE - dSE;
}

export function makeRouteKey() {
  const { startPos, endPos } = state;
  if (!startPos || !endPos) return "";
  const s = `${startPos.y.toFixed(5)},${startPos.x.toFixed(5)}`;
  const e = `${endPos.y.toFixed(5)},${endPos.x.toFixed(5)}`;
  return `${s}__${e}`;
}

export function getNearestFromList(my, list, latKeys, lngKeys) {
  if (!Array.isArray(list) || list.length === 0) return null;

  let best = null;
  let bestDist = Infinity;

  for (const item of list) {
    const lat = Number(getFirst(item, latKeys));
    const lng = Number(getFirst(item, lngKeys));
    if (!lat || !lng) continue;

    const d = haversineMeters(my, { lat, lng });
    if (d < bestDist) {
      bestDist = d;
      best = { item, lat, lng, dist: d };
    }
  }
  return best;
}
