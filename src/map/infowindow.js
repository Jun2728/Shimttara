// /src/map/infowindow.js
import { state } from "../core/state.js";
import { escapeHtml } from "../core/utils.js";

export function closeInfo() {
  if (state.infoWindow) state.infoWindow.close();
}

export function showHoverOverlay(position, text) {
  hideHoverOverlay();
  state.hoverOverlay = new naver.maps.Marker({
    position,
    map: state.map,
    icon: {
      content: `
        <div style="
          transform: translate(-50%, -140%);
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 10px 18px rgba(0,0,0,.14);
          white-space: nowrap;
          user-select:none;
        ">
          ${escapeHtml(text)}
        </div>
      `,
      size: new naver.maps.Size(1, 1),
      anchor: new naver.maps.Point(0, 0),
    },
    clickable: false,
  });
}

export function hideHoverOverlay() {
  if (state.hoverOverlay) {
    state.hoverOverlay.setMap(null);
    state.hoverOverlay = null;
  }
}
