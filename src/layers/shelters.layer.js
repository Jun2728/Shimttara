// /src/layers/shelters.layer.js
import { PATHS } from "../core/config.js";
import { state } from "../core/state.js";
import {
  safeText,
  toLatLng,
  escapeHtml,
  makeShelterChip,
  normalizeShelterType,
  setPill,
} from "../core/utils.js";
import { closeInfo, showHoverOverlay, hideHoverOverlay } from "../map/infowindow.js";
import { applyShelterLayerVisibility } from "./layer.toggle.js";
import { highlightPassShelter } from "../route/route.render.js";
import { renderRouteIfReady } from "../route/route.render.js";

function getShelterUiMeta(type) {
  const isSmart = type === "SMART";
  if (isSmart) return { chipText: "스마트", typeLabel: "스마트 쉼터", typeColor: "#16a34a" };

  const isHeat = state.ROUTE_MODE === "HEAT";
  if (isHeat) return { chipText: "무더위", typeLabel: "무더위 쉼터", typeColor: "#f97316" };

  return { chipText: "한파", typeLabel: "한파·무더위 쉼터", typeColor: "#2563eb" };
}

export function refreshShelterMarkerIcons() {
  if (!Array.isArray(state.shelterMarkers) || state.shelterMarkers.length === 0) return;
  state.shelterMarkers.forEach((m) => {
    const t = m?.__shelterType;
    if (!t) return;
    m.setIcon(makeShelterChip(t));
  });
}

export async function loadShelters() {
  try {
    const res = await fetch(PATHS.SHELTER_JSON_PATH);
    if (!res.ok) throw new Error("Failed to fetch shelters JSON: " + res.status);

    const shelters = await res.json();
    state.sheltersList = Array.isArray(shelters) ? shelters : shelters.data || [];

    state.shelterMarkers.forEach((m) => m.setMap(null));
    state.shelterMarkers = [];

    state.sheltersList.forEach((s, idx) => {
      const lat = Number(s.lat);
      const lng = Number(s.lng);
      if (!lat || !lng) return;

      const pos = toLatLng(lat, lng);
      const name = safeText(s.name || s.facilityName || s["시설명"] || "쉼터");
      const addr = safeText(s.roadAddress || s.addr || s.address || s["도로명주소"] || s["상세주소"] || "");
      const place = safeText(s.place || s.location || s["설치장소"] || "");
      const type = normalizeShelterType(s.type);

      const marker = new naver.maps.Marker({
        map: state.map,
        position: pos,
        title: name,
        icon: makeShelterChip(type),
      });

      marker.__shelterType = type;
      marker.__shelterName = name;
      marker.__shelterPos = pos;

      naver.maps.Event.addListener(marker, "mouseover", () => {
        const t = marker.__shelterType;
        const ui = getShelterUiMeta(t);
        showHoverOverlay(pos, `${ui.chipText} · ${marker.__shelterName}`);
      });
      naver.maps.Event.addListener(marker, "mouseout", () => hideHoverOverlay());

      naver.maps.Event.addListener(marker, "click", () => {
        closeInfo();

        const btnId = `btnUseAsPass_${idx}`;
        const t = marker.__shelterType;
        const ui = getShelterUiMeta(t);

        const html = `
          <div style="padding:12px 14px; max-width:300px;">
            <div style="font-weight:900; font-size:14px; margin-bottom:6px;">${escapeHtml(name)}</div>
            <div style="font-size:13px; font-weight:900; color:${ui.typeColor}; margin-bottom:10px;">${escapeHtml(
          ui.typeLabel
        )}</div>
            ${addr ? `<div style="font-size:13px; color:#374151; margin-bottom:6px;">주소: ${escapeHtml(addr)}</div>` : ""}
            ${
              place
                ? `<div style="font-size:13px; color:#374151; margin-bottom:6px;">설치장소: ${escapeHtml(place)}</div>`
                : ""
            }
            <div style="margin-top:12px;">
              <button id="${btnId}" style="
                border:1px solid #e5e7eb; background:#fff; border-radius:12px;
                padding:10px 12px; font-weight:900; cursor:pointer; font-size:13px;
              ">이 쉼터를 경유지로 사용</button>
            </div>
          </div>
        `;

        state.infoWindow.setContent(html);
        state.infoWindow.open(state.map, marker);

        setTimeout(() => {
          const btn = document.getElementById(btnId);
          if (!btn) return;

          btn.onclick = () => {
            state.pickedShelter = { name, lat, lng, pickedBy: "manual", type: t };
            setPill(state.dom.pillShelter, `경유쉼터(수동): ${name}`);
            highlightPassShelter(state.pickedShelter);

            renderRouteIfReady(true);
            closeInfo();
          };
        }, 0);
      });

      state.shelterMarkers.push(marker);
    });

    applyShelterLayerVisibility();
    console.log(`✅ 쉼터 마커 로드 완료: ${state.shelterMarkers.length}개`);
  } catch (err) {
    console.error(err);
    alert("쉼터 JSON 로드 실패. 콘솔 확인 + JSON 경로 확인!");
  }
}
