// /src/route/route.render.js
import { FIXED_PASS_WANGSIMNI_EXIT4 } from "../core/config.js";
import { state } from "../core/state.js";
import { toLatLng, setPill, getModeLabel, makeRouteKey, haversineMeters, detourScore, safeText, normalizeShelterType, isColdModePassable } from "../core/utils.js";
import { fetchTmapPedestrianRoute } from "./tmap.api.js";

export function highlightPassShelter(s) {
  if (state.passMarker) state.passMarker.setMap(null);

  state.passMarker = new naver.maps.Marker({
    map: state.map,
    position: toLatLng(s.lat, s.lng),
    title: "경유: " + s.name,
    icon: {
      content: `
        <div style="
          width:20px;height:20px;border-radius:999px;
          background: rgba(3,199,90,.95);
          border: 3px solid white;
          box-shadow: 0 8px 18px rgba(0,0,0,.22);
          transform: translate(-50%,-50%);
        "></div>
      `,
      size: new naver.maps.Size(1, 1),
      anchor: new naver.maps.Point(0, 0),
    },
  });
}

// ✅ 쉼터 1개 자동 추천
function autoPickShelter(startPos, endPos) {
  if (!startPos || !endPos) return null;
  if (!state.sheltersList || state.sheltersList.length === 0) return null;

  const start = { lat: startPos.y, lng: startPos.x };
  const end = { lat: endPos.y, lng: endPos.x };

  const dSE = haversineMeters(start, end);
  const maxScore = Math.max(800, dSE * 0.6);

  let best = null;
  let bestScore = Infinity;

  for (const s of state.sheltersList) {
    const lat = Number(s.lat);
    const lng = Number(s.lng);
    if (!lat || !lng) continue;

    if (state.ROUTE_MODE === "COLD") {
      if (!isColdModePassable(s)) continue;
    }

    const p = { lat, lng };
    const score = detourScore(start, end, p);
    if (score > maxScore) continue;

    if (score < bestScore) {
      bestScore = score;
      best = {
        name: safeText(s.name || s.facilityName || s["시설명"] || "쉼터"),
        lat,
        lng,
        pickedBy: "auto",
        type: normalizeShelterType(s.type),
      };
    }
  }

  return best;
}

export async function renderRouteIfReady(force = false) {
  if (!state.startPos || !state.endPos) return;

  const routeKey = makeRouteKey();

  if (!force && routeKey && state.lastRouteKey && routeKey !== state.lastRouteKey) {
    if (state.pickedShelter?.pickedBy === "auto") {
      state.pickedShelter = null;
      if (state.passMarker) {
        state.passMarker.setMap(null);
        state.passMarker = null;
      }
      setPill(state.dom.pillShelter, "경유쉼터: -");
    }
  }

  state.lastRouteKey = routeKey;

  if (state.baseLine) state.baseLine.setMap(null);

  const startLat = state.startPos.y,
    startLng = state.startPos.x;
  const endLat = state.endPos.y,
    endLng = state.endPos.x;

  let pass = null;

  if (state.ROUTE_MODE === "COLD") {
    const isSeongdongOffice = (state.endLabel || "").includes("성동구청");

    if (isSeongdongOffice) {
      pass = FIXED_PASS_WANGSIMNI_EXIT4;
      state.pickedShelter = pass;
      setPill(state.dom.pillShelter, `경유쉼터(고정): ${pass.name}`);
      highlightPassShelter(pass);
    } else {
      pass = state.pickedShelter;

      if (!pass) {
        pass = autoPickShelter(state.startPos, state.endPos);
        state.pickedShelter = pass;

        if (pass) {
          setPill(state.dom.pillShelter, `경유쉼터(자동): ${pass.name}`);
          highlightPassShelter(pass);
        } else {
          setPill(state.dom.pillShelter, "경유쉼터: -");
        }
      } else {
        const tag = pass.pickedBy === "manual" ? "수동" : pass.pickedBy === "fixed" ? "고정" : "자동";
        setPill(state.dom.pillShelter, `경유쉼터(${tag}): ${pass.name}`);
        highlightPassShelter(pass);
      }
    }
  } else {
    if (state.pickedShelter && state.pickedShelter.pickedBy === "manual") {
      pass = state.pickedShelter;
      setPill(state.dom.pillShelter, `경유쉼터(수동): ${pass.name}`);
      highlightPassShelter(pass);
    } else {
      if (state.passMarker) {
        state.passMarker.setMap(null);
        state.passMarker = null;
      }
      setPill(state.dom.pillShelter, "경유쉼터: -");
    }
  }

  const passList = pass ? `${pass.lng},${pass.lat}` : "";

  try {
    setPill(state.dom.pillRoute, "경로: 계산 중...");
    const data = await fetchTmapPedestrianRoute({ startLat, startLng, endLat, endLng, passList });

    const coords = data?.coords || [];
    const meta = data?.meta || {};
    const dist = meta.totalDistance != null ? `${Math.round(meta.totalDistance)}m` : "-";
    const time = meta.totalTime != null ? `${Math.round(meta.totalTime / 60)}분` : "-";

    if (coords.length < 2) {
      state.baseLine = new naver.maps.Polyline({
        map: state.map,
        path: [state.startPos, state.endPos],
        strokeWeight: 6,
      });
      setPill(state.dom.pillRoute, `경로: 직선(fallback) / ${getModeLabel()} / 거리 ${dist} / 시간 ${time}`);
      return;
    }

    const path = coords.map((c) => toLatLng(c.lat, c.lng));
    state.baseLine = new naver.maps.Polyline({
      map: state.map,
      path,
      strokeWeight: 6,
    });

    setPill(state.dom.pillRoute, `경로: 도보(Tmap) / ${getModeLabel()} / 거리 ${dist} / 시간 ${time}`);
  } catch (err) {
    console.error(err);

    state.baseLine = new naver.maps.Polyline({
      map: state.map,
      path: [state.startPos, state.endPos],
      strokeWeight: 6,
    });

    setPill(state.dom.pillRoute, "경로: 직선(fallback) / Tmap 실패");
  }
}

export function recalculateRoute() {
  renderRouteIfReady(true);
}
