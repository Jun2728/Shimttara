// /src/ui/logic.js
import { state } from "../core/state.js";
import { FAV, DEST_KEYWORDS, MY_POS } from "../core/config.js";
import { ICONS, safeText, toLatLng } from "../core/utils.js";
import { renderRouteIfReady } from "../route/route.render.js";

export function setStartToHome() {
  const p = FAV.home;
  state.startPos = toLatLng(p.lat, p.lng);
  if (state.dom.startInput) state.dom.startInput.value = p.label;

  if (!state.startMarker) {
    state.startMarker = new naver.maps.Marker({
      map: state.map,
      position: state.startPos,
      title: "출발: " + p.label,
      icon: ICONS.START_ICON,
    });
  } else {
    state.startMarker.setPosition(state.startPos);
    state.startMarker.setIcon(ICONS.START_ICON);
  }

  state.map.panTo(state.startPos);
  renderRouteIfReady();
}

export function setMyLocationOnly() {
  const pos = toLatLng(MY_POS.lat, MY_POS.lng);

  if (!state.myMarker) {
    state.myMarker = new naver.maps.Marker({
      map: state.map,
      position: pos,
      title: "내 현재 위치",
      icon: ICONS.MY_ICON,
    });
  } else {
    state.myMarker.setPosition(pos);
    state.myMarker.setIcon(ICONS.MY_ICON);
    state.myMarker.setMap(state.map);
  }

  state.map.panTo(pos);
}

function resolveKeywordOrNull(text) {
  const q = safeText(text).trim();
  if (!q) return null;

  if (DEST_KEYWORDS[q]) return DEST_KEYWORDS[q];
  for (const k of Object.keys(DEST_KEYWORDS)) {
    if (q.includes(k)) return DEST_KEYWORDS[k];
  }
  return null;
}

function geocodeAddress(address) {
  const tryGeocode = (query) =>
    new Promise((resolve, reject) => {
      naver.maps.Service.geocode({ query }, (status, response) => {
        if (status !== naver.maps.Service.Status.OK) {
          return reject(new Error("Geocode failed: " + status));
        }
        const items = response?.v2?.addresses || [];
        if (items.length === 0) return resolve(null);

        const it = items[0];
        const lat = Number(it.y);
        const lng = Number(it.x);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return resolve(null);

        resolve({ lat, lng, roadAddress: it.roadAddress, jibunAddress: it.jibunAddress });
      });
    });

  return (async () => {
    const q = safeText(address).trim();
    if (!q) return null;

    let r = await tryGeocode(q);
    if (r) return r;

    const needSeoulPrefix =
      !q.includes("서울") && (q.startsWith("성동구") || q.includes("성동구") || q.includes("고산자로"));

    if (needSeoulPrefix) {
      r = await tryGeocode("서울특별시 " + q);
      if (r) return r;
    }

    return null;
  })();
}

function setStartFromLatLng(p, label) {
  state.startPos = toLatLng(p.lat, p.lng);

  if (!state.startMarker) {
    state.startMarker = new naver.maps.Marker({
      map: state.map,
      position: state.startPos,
      title: "출발: " + label,
      icon: ICONS.START_ICON,
    });
  } else {
    state.startMarker.setPosition(state.startPos);
    state.startMarker.setIcon(ICONS.START_ICON);
  }
  state.map.panTo(state.startPos);
  renderRouteIfReady();
}

function setEndFromLatLng(p, label) {
  state.endPos = toLatLng(p.lat, p.lng);
  state.endLabel = safeText(label).trim();

  if (!state.endMarker) {
    state.endMarker = new naver.maps.Marker({
      map: state.map,
      position: state.endPos,
      title: "도착: " + label,
      icon: ICONS.END_ICON,
    });
  } else {
    state.endMarker.setPosition(state.endPos);
    state.endMarker.setIcon(ICONS.END_ICON);
  }
  state.map.panTo(state.endPos);
  renderRouteIfReady();
}

export async function searchBoth() {
  const startText = safeText(state.dom.startInput?.value).trim();
  const endText = safeText(state.dom.endInput?.value).trim();

  try {
    if (startText) {
      const s = await geocodeAddress(startText);
      if (s) setStartFromLatLng({ lat: s.lat, lng: s.lng }, startText);
      else alert('출발지 검색 결과가 없어요. 예: "성동구 고산자로 1"');
    }

    if (endText) {
      const kw = resolveKeywordOrNull(endText);
      if (kw) {
        setEndFromLatLng({ lat: kw.lat, lng: kw.lng }, kw.label);
      } else {
        const e = await geocodeAddress(endText);
        if (e) setEndFromLatLng({ lat: e.lat, lng: e.lng }, endText);
        else alert('도착지 검색 결과가 없어요. 예: "성동구청", "한양대병원", "성동구 고산자로 1"');
      }
    }

    renderRouteIfReady();
  } catch (err) {
    console.error(err);
    alert("검색 중 오류가 발생했어요. 콘솔을 확인해줘.");
  }
}
