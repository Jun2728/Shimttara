// /src/ui/weather.widget.js
import { state } from "../core/state.js";
import { getDemoTempC } from "../core/utils.js";

export function renderWeatherWidget() {
  const w = document.getElementById("weatherWidget");
  const iconEl = document.getElementById("weatherIcon");
  const tempEl = document.getElementById("tempValue");
  const badgeEl = document.getElementById("modeBadge");
  if (!w || !iconEl || !tempEl || !badgeEl) return;

  w.style.display = state.SHOW_MODE_WIDGET ? "flex" : "none";
  if (!state.SHOW_MODE_WIDGET) return;

  const isCold = state.ROUTE_MODE === "COLD";
  const isHeat = state.ROUTE_MODE === "HEAT";

  iconEl.textContent = isCold ? "❄️" : isHeat ? "☀️" : "🌤️";
  tempEl.textContent = String(getDemoTempC());
  badgeEl.textContent = isCold ? "추워요, 쉬엄쉬엄" : isHeat ? "더워요, 잠깐 쉬어가요" : "일반 기온";

  if (isCold) {
    badgeEl.style.border = "1px solid rgba(0,170,255,0.55)";
    badgeEl.style.background = "rgba(0,170,255,0.18)";
    badgeEl.style.color = "#bfe9ff";
  } else if (isHeat) {
    badgeEl.style.border = "1px solid rgba(255,140,0,0.55)";
    badgeEl.style.background = "rgba(255,140,0,0.18)";
    badgeEl.style.color = "#ffe3bf";
  } else {
    badgeEl.style.border = "1px solid rgba(255,255,255,0.25)";
    badgeEl.style.background = "rgba(255,255,255,0.12)";
    badgeEl.style.color = "rgba(255,255,255,0.9)";
  }
}
