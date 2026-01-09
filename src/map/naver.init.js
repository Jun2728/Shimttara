// /src/map/naver.init.js
import { state } from "../core/state.js";
import { toLatLng, setPill } from "../core/utils.js";
import { closeInfo } from "./infowindow.js";
import { togglePickMode } from "./pickmode.js";
import { bindUI } from "../ui/bindings.js";
import { renderWeatherWidget } from "../ui/weather.widget.js";
import { refreshLayerButtonsUI } from "../layers/layer.toggle.js";
import { loadShelters, refreshShelterMarkerIcons } from "../layers/shelters.layer.js";
import { loadMobilityStations } from "../layers/mobility.layer.js";
import { loadToilets } from "../layers/toilets.layer.js";
import { recalculateRoute } from "../route/route.render.js";
import { highlightPassShelter } from "../route/route.render.js";

export function initMap() {
  const center = toLatLng(37.5636, 127.0367);

  state.map = new naver.maps.Map("map", {
    center,
    zoom: 14,
    zoomControl: true,
    zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
  });

  state.infoWindow = new naver.maps.InfoWindow({
    borderWidth: 1,
    anchorSkew: true,
  });

  naver.maps.Event.addListener(state.map, "click", (e) => {
    closeInfo();
    if (state.pickMode) {
      const lat = e.coord.y;
      const lng = e.coord.x;
      console.log(`lat=${lat}, lng=${lng}`);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeInfo();

    if (e.shiftKey && (e.key === "P" || e.key === "p")) {
      togglePickMode();
      return;
    }

    if (e.shiftKey && (e.key === "H" || e.key === "h")) {
      e.preventDefault();

      if (state.ROUTE_MODE === "NORMAL") state.ROUTE_MODE = "COLD";
      else if (state.ROUTE_MODE === "COLD") state.ROUTE_MODE = "HEAT";
      else state.ROUTE_MODE = "NORMAL";

      state.SHOW_MODE_WIDGET = true;
      renderWeatherWidget();

      // ✅ COLD 외 모드에서는: 수동경유만 유지
      if (state.ROUTE_MODE !== "COLD") {
        if (state.pickedShelter && state.pickedShelter.pickedBy !== "manual") {
          state.pickedShelter = null;
        }

        if (state.pickedShelter && state.pickedShelter.pickedBy === "manual") {
          setPill(state.dom.pillShelter, `경유쉼터(수동): ${state.pickedShelter.name}`);
          highlightPassShelter(state.pickedShelter);
        } else {
          if (state.passMarker) {
            state.passMarker.setMap(null);
            state.passMarker = null;
          }
          setPill(state.dom.pillShelter, "경유쉼터: -");
        }
      }

      refreshShelterMarkerIcons();
      recalculateRoute();
      return;
    }
  });

  setPill(state.dom.pillPick, "좌표따기: OFF");

  bindUI();
  refreshLayerButtonsUI();

  loadShelters();
  loadMobilityStations();
  loadToilets();
}
