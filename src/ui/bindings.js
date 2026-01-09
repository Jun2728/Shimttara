// /src/ui/bindings.js
import { state } from "../core/state.js";
import { setStartToHome, searchBoth, setMyLocationOnly } from "./logic.js";
import { refreshLayerButtonsUI, applyShelterLayerVisibility, applyToiletLayerVisibility, applyMobilityLayerVisibility } from "../layers/layer.toggle.js";
import { guideNearestMobility } from "../layers/mobility.layer.js";
import { guideNearestToilet } from "../layers/toilets.layer.js";

export function bindUI() {
  const {
    btnSearch,
    btnReset,
    startInput,
    endInput,
    favHome,
    btnMyLocation,
    btnNearMobility,
    btnNearToilet,
    btnLayerSmart,
    btnLayerShelter,
    btnLayerToilet,
    btnLayerMobility,
  } = state.dom;

  btnSearch?.addEventListener("click", () => searchBoth());
  startInput?.addEventListener("keydown", (e) => e.key === "Enter" && searchBoth());
  endInput?.addEventListener("keydown", (e) => e.key === "Enter" && searchBoth());

  favHome?.addEventListener("click", () => setStartToHome());

  btnReset?.addEventListener("click", () => location.reload());

  btnMyLocation?.addEventListener("click", () => setMyLocationOnly());

  btnNearMobility?.addEventListener("click", () => {
    setMyLocationOnly();
    guideNearestMobility();
  });
  btnNearToilet?.addEventListener("click", () => {
    setMyLocationOnly();
    guideNearestToilet();
  });

  btnLayerSmart?.addEventListener("click", () => {
    state.LAYER.smart = !state.LAYER.smart;
    refreshLayerButtonsUI();
    applyShelterLayerVisibility();
  });

  btnLayerShelter?.addEventListener("click", () => {
    state.LAYER.shelter = !state.LAYER.shelter;
    refreshLayerButtonsUI();
    applyShelterLayerVisibility();
  });

  btnLayerToilet?.addEventListener("click", () => {
    state.LAYER.toilet = !state.LAYER.toilet;
    refreshLayerButtonsUI();
    applyToiletLayerVisibility();
  });

  btnLayerMobility?.addEventListener("click", () => {
    state.LAYER.mobility = !state.LAYER.mobility;
    refreshLayerButtonsUI();
    applyMobilityLayerVisibility();
  });
}
