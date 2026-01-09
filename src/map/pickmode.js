// /src/map/pickmode.js
import { state } from "../core/state.js";
import { setPill } from "../core/utils.js";

export function togglePickMode() {
  state.pickMode = !state.pickMode;
  setPill(state.dom.pillPick, `좌표따기: ${state.pickMode ? "ON" : "OFF"}`);
  console.log(`[좌표따기] ${state.pickMode ? "ON" : "OFF"}`);
}
