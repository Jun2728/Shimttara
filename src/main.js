// /src/main.js
import { state } from "./core/state.js";
import { initMap } from "./map/naver.init.js";

// DOM 캐시
state.dom = {
  startInput: document.getElementById("startInput"),
  endInput: document.getElementById("endInput"),
  btnSearch: document.getElementById("btnSearch"),
  btnReset: document.getElementById("btnReset"),
  favHome: document.getElementById("favHome"),
  favWork: document.getElementById("favWork"),

  btnMyLocation: document.getElementById("btnMyLocation"),
  btnNearMobility: document.getElementById("btnNearMobility"),
  btnNearToilet: document.getElementById("btnNearToilet"),

  btnLayerSmart: document.getElementById("btnLayerSmart"),
  btnLayerShelter: document.getElementById("btnLayerShelter"),
  btnLayerToilet: document.getElementById("btnLayerToilet"),
  btnLayerMobility: document.getElementById("btnLayerMobility"),

  pillRoute: document.getElementById("pillRoute"),
  pillPick: document.getElementById("pillPick"),
  pillShelter: document.getElementById("pillShelter"),
};

function waitForNaver() {
  if (window.naver && window.naver.maps && document.getElementById("map")) {
    initMap();
    return;
  }
  setTimeout(waitForNaver, 30);
}

waitForNaver();
