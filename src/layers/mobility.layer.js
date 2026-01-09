// /src/layers/mobility.layer.js
import { PATHS, MY_POS } from "../core/config.js";
import { state } from "../core/state.js";
import { safeText, toLatLng, escapeHtml, getNearestFromList } from "../core/utils.js";
import { closeInfo, showHoverOverlay, hideHoverOverlay } from "../map/infowindow.js";
import { applyMobilityLayerVisibility, refreshLayerButtonsUI } from "./layer.toggle.js";

function makeWheelchairMarkerIcon() {
  return {
    content: `
      <div style="
        transform: translate(-50%,-115%);
        font-size:22px;
        line-height:1;
        user-select:none;
        text-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">♿</div>
    `,
    size: new naver.maps.Size(1, 1),
    anchor: new naver.maps.Point(0, 0),
  };
}

export async function loadMobilityStations() {
  try {
    const res = await fetch(PATHS.MOBILITY_JSON_PATH);
    if (!res.ok) throw new Error("Failed to fetch mobility JSON: " + res.status);

    const json = await res.json();
    const list = Array.isArray(json) ? json : json.DATA || json.data || [];
    state.mobilityStations = Array.isArray(list) ? list : [];

    state.mobilityMarkers.forEach((m) => m.setMap(null));
    state.mobilityMarkers = [];

    state.mobilityStations.forEach((s, idx) => {
      const lat = Number(s.latitude ?? s.lat ?? s.y);
      const lng = Number(s.longitude ?? s.lng ?? s.x);
      if (!lat || !lng) return;

      const name = safeText(s.fcltynm || s.name || `급속 충전소 ${idx + 1}`);
      const addr = safeText(s.rdnmadr || s.address || "");
      const place = safeText(s.instllcdesc || s.place || "");

      const weekday = safeText(s.weekdayoperopenhhmm || "");
      const weekdayClose = safeText(s.weekdayopercolsehhmm || "");
      const sat = safeText(s.satoperopenhhmm || "");
      const satClose = safeText(s.satoperclosehhmm || "");
      const holi = safeText(s.holidayoperopenhhmm || "");
      const holiClose = safeText(s.holidayoperclosehhmm || "");

      const pos = toLatLng(lat, lng);

      const marker = new naver.maps.Marker({
        map: state.map,
        position: pos,
        title: name,
        icon: makeWheelchairMarkerIcon(),
      });

      naver.maps.Event.addListener(marker, "mouseover", () => showHoverOverlay(pos, `♿ ${name}`));
      naver.maps.Event.addListener(marker, "mouseout", () => hideHoverOverlay());

      naver.maps.Event.addListener(marker, "click", () => {
        closeInfo();

        const html = `
          <div style="padding:12px 14px; max-width:320px;">
            <div style="font-weight:900; font-size:14px; margin-bottom:8px;">♿ ${escapeHtml(name)}</div>
            ${addr ? `<div style="font-size:13px; color:#374151; margin-bottom:6px;">주소: ${escapeHtml(addr)}</div>` : ""}
            ${place ? `<div style="font-size:13px; color:#374151; margin-bottom:10px;">설치: ${escapeHtml(place)}</div>` : ""}
            <div style="font-size:13px; color:#6b7280; line-height:1.55;">
              ${weekday ? `평일 ${escapeHtml(weekday)}~${escapeHtml(weekdayClose)}` : "운영시간: -"}<br/>
              ${sat ? `토요일 ${escapeHtml(sat)}~${escapeHtml(satClose)}` : ""}${sat ? "<br/>" : ""}
              ${holi ? `공휴일 ${escapeHtml(holi)}~${escapeHtml(holiClose)}` : ""}
            </div>
          </div>
        `;

        state.infoWindow.setContent(html);
        state.infoWindow.open(state.map, marker);
      });

      state.mobilityMarkers.push(marker);
    });

    applyMobilityLayerVisibility();
    console.log(`✅ ♿ 급속 충전소 마커 로드 완료: ${state.mobilityMarkers.length}개`);
  } catch (err) {
    console.error(err);
    alert("♿ 충전소 JSON 로드 실패. 콘솔 확인 + 파일 경로 확인!");
  }
}

export function guideNearestMobility() {
  if (!state.LAYER.mobility) {
    state.LAYER.mobility = true;
    refreshLayerButtonsUI();
    applyMobilityLayerVisibility();
  }

  const my = { lat: MY_POS.lat, lng: MY_POS.lng };
  const nearest = getNearestFromList(my, state.mobilityStations, ["latitude", "lat", "y"], ["longitude", "lng", "x"]);
  if (!nearest) {
    alert("충전소 데이터가 없어요.");
    return;
  }

  const { item, lat, lng, dist } = nearest;
  const pos = toLatLng(lat, lng);
  state.map.panTo(pos);

  const name = safeText(item.fcltynm || item.name || "급속 충전소");
  const addr = safeText(item.rdnmadr || item.address || "");
  const place = safeText(item.instllcdesc || item.place || "");

  const html = `
    <div style="padding:12px 14px; max-width:320px;">
      <div style="font-weight:900; font-size:14px; margin-bottom:8px;">♿ ${escapeHtml(name)}</div>
      <div style="font-size:13px; color:#374151; margin-bottom:6px;">내 위치 기준 약 ${Math.round(dist)}m</div>
      ${addr ? `<div style="font-size:13px; color:#374151; margin-bottom:6px;">주소: ${escapeHtml(addr)}</div>` : ""}
      ${place ? `<div style="font-size:13px; color:#374151;">설치: ${escapeHtml(place)}</div>` : ""}
    </div>
  `;

  closeInfo();
  state.infoWindow.setContent(html);
  state.infoWindow.open(state.map, pos);
}
