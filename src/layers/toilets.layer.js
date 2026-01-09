// /src/layers/toilets.layer.js
import { PATHS, MY_POS } from "../core/config.js";
import { state } from "../core/state.js";
import { safeText, toLatLng, escapeHtml, getFirst, getNearestFromList } from "../core/utils.js";
import { closeInfo, showHoverOverlay, hideHoverOverlay } from "../map/infowindow.js";
import { applyToiletLayerVisibility, refreshLayerButtonsUI } from "./layer.toggle.js";

function makeToiletMarkerIcon() {
  return {
    content: `
      <div style="
        transform: translate(-50%,-110%);
        display:flex; align-items:center; justify-content:center;
        width:26px; height:26px;
        border-radius:999px;
        background: rgba(17,24,39,0.92);
        border: 3px solid #ffffff;
        box-shadow: 0 10px 18px rgba(0,0,0,0.22);
        user-select:none;
      ">
        <div style="font-size:20px; line-height:1;">🚻</div>
      </div>
    `,
    size: new naver.maps.Size(1, 1),
    anchor: new naver.maps.Point(0, 0),
  };
}

export async function loadToilets() {
  try {
    const res = await fetch(PATHS.TOILET_JSON_PATH);
    if (!res.ok) throw new Error("Failed to fetch toilets JSON: " + res.status);

    const json = await res.json();
    const list =
      Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.DATA)
        ? json.DATA
        : Array.isArray(json?.records)
        ? json.records
        : [];

    state.toiletsList = list;

    state.toiletMarkers.forEach((m) => m.setMap(null));
    state.toiletMarkers = [];

    state.toiletsList.forEach((t, idx) => {
      const lat = Number(getFirst(t, ["lat", "LAT", "위도", "Y", "y", "latitude"]));
      const lng = Number(getFirst(t, ["lng", "LNG", "경도", "X", "x", "longitude"]));
      if (!lat || !lng) return;

      const name = safeText(getFirst(t, ["name", "화장실명", "시설명", "TITLE", "title"]) || `공공화장실 ${idx + 1}`);
      const addr = safeText(
        getFirst(t, ["addr", "address", "도로명주소", "지번주소", "소재지도로명주소", "소재지지번주소"])
      );

      const pos = toLatLng(lat, lng);

      const marker = new naver.maps.Marker({
        map: state.map,
        position: pos,
        title: name,
        icon: makeToiletMarkerIcon(),
      });

      naver.maps.Event.addListener(marker, "mouseover", () => showHoverOverlay(pos, `🚻 ${name}`));
      naver.maps.Event.addListener(marker, "mouseout", () => hideHoverOverlay());

      naver.maps.Event.addListener(marker, "click", () => {
        closeInfo();

        const html = `
          <div style="padding:12px 14px; max-width:320px;">
            <div style="font-weight:900; font-size:14px; margin-bottom:8px;">🚻 ${escapeHtml(name)}</div>
            ${addr ? `<div style="font-size:13px; color:#374151; margin-bottom:8px;">주소: ${escapeHtml(addr)}</div>` : ""}
          </div>
        `;
        state.infoWindow.setContent(html);
        state.infoWindow.open(state.map, marker);
      });

      state.toiletMarkers.push(marker);
    });

    applyToiletLayerVisibility();
    console.log(`✅ 🚻 공공화장실 마커 로드 완료: ${state.toiletMarkers.length}개`);
  } catch (err) {
    console.error(err);
    alert("🚻 화장실 JSON 로드 실패. 콘솔 확인 + 파일 경로 확인!");
  }
}

export function guideNearestToilet() {
  if (!state.LAYER.toilet) {
    state.LAYER.toilet = true;
    refreshLayerButtonsUI();
    applyToiletLayerVisibility();
  }

  const my = { lat: MY_POS.lat, lng: MY_POS.lng };
  const nearest = getNearestFromList(
    my,
    state.toiletsList,
    ["lat", "LAT", "위도", "Y", "y", "latitude"],
    ["lng", "LNG", "경도", "X", "x", "longitude"]
  );

  if (!nearest) {
    alert("화장실 데이터가 없어요.");
    return;
  }

  const { item, lat, lng, dist } = nearest;
  const pos = toLatLng(lat, lng);
  state.map.panTo(pos);

  const name = safeText(getFirst(item, ["name", "화장실명", "시설명", "TITLE", "title"]) || "공공화장실");
  const addr = safeText(
    getFirst(item, ["addr", "address", "도로명주소", "지번주소", "소재지도로명주소", "소재지지번주소"])
  );

  const html = `
    <div style="padding:12px 14px; max-width:320px;">
      <div style="font-weight:900; font-size:14px; margin-bottom:8px;">🚻 ${escapeHtml(name)}</div>
      <div style="font-size:13px; color:#374151; margin-bottom:6px;">내 위치 기준 약 ${Math.round(dist)}m</div>
      ${addr ? `<div style="font-size:13px; color:#374151;">주소: ${escapeHtml(addr)}</div>` : ""}
    </div>
  `;

  closeInfo();
  state.infoWindow.setContent(html);
  state.infoWindow.open(state.map, pos);
}
