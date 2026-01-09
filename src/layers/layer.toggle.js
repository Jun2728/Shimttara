// /src/layers/layer.toggle.js
import { state } from "../core/state.js";

function setBtnActive(btn, isOn) {
  if (!btn) return;
  btn.classList.toggle("active", !!isOn);
}

export function refreshLayerButtonsUI() {
  const { btnLayerSmart, btnLayerShelter, btnLayerToilet, btnLayerMobility } = state.dom;
  setBtnActive(btnLayerSmart, state.LAYER.smart);
  setBtnActive(btnLayerShelter, state.LAYER.shelter);
  setBtnActive(btnLayerToilet, state.LAYER.toilet);
  setBtnActive(btnLayerMobility, state.LAYER.mobility);
}

export function applyShelterLayerVisibility() {
  if (!Array.isArray(state.shelterMarkers)) return;

  state.shelterMarkers.forEach((m) => {
    const t = m?.__shelterType; // "SMART" | "SHELTER"
    if (!t) return;

    const shouldShow = (t === "SMART" && state.LAYER.smart) || (t === "SHELTER" && state.LAYER.shelter);
    m.setMap(shouldShow ? state.map : null);
  });
}

export function applyMobilityLayerVisibility() {
  if (!Array.isArray(state.mobilityMarkers)) return;
  state.mobilityMarkers.forEach((m) => m.setMap(state.LAYER.mobility ? state.map : null));
}

export function applyToiletLayerVisibility() {
  if (!Array.isArray(state.toiletMarkers)) return;
  state.toiletMarkers.forEach((m) => m.setMap(state.LAYER.toilet ? state.map : null));
}
