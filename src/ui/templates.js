/* =========================================================
   src/ui/templates.js
   - map overlay & infoWindow HTML templates (unified)
========================================================= */

function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** 타입별 배지 텍스트/아이콘/클래스 */
export function getTypeBadge(type) {
  // type: "SMART" | "COLD" | "HOT" | "TOILET" | "MOBILITY" | etc
  switch (type) {
    case "SMART":
      return { text: "스마트", icon: "🧊", className: "badge badge--smart" };
    case "COLD":
      return { text: "한파", icon: "❄️", className: "badge badge--cold" };
    case "HOT":
      return { text: "무더위", icon: "☀️", className: "badge badge--hot" };
    case "TOILET":
      return { text: "화장실", icon: "🚻", className: "badge badge--toilet" };
    case "MOBILITY":
      return { text: "충전소", icon: "♿", className: "badge badge--mobility" };
    default:
      return { text: "시설", icon: "📍", className: "badge badge--default" };
  }
}

/** 라벨-값 한 줄 */
export function kvRow(label, value) {
  if (!value) return "";
  return `
    <div class="kv">
      <div class="kv__k">${esc(label)}</div>
      <div class="kv__v">${esc(value)}</div>
    </div>
  `;
}

/** Hover overlay (작게, 제목+배지 중심) */
export function buildHoverOverlayHTML({
  type,
  title,
  subtitle, // optional: 간단 주소/설치장소 등 1줄
}) {
  const b = getTypeBadge(type);
  const safeTitle = esc(title || "이름 없음");
  const safeSub = subtitle ? esc(subtitle) : "";

  return `
    <div class="map-card map-card--hover" role="tooltip" aria-label="시설 정보">
      <div class="map-card__top">
        <span class="${b.className}">
          <span class="badge__icon">${b.icon}</span>
          <span class="badge__text">${esc(b.text)}</span>
        </span>
      </div>
      <div class="map-card__title">${safeTitle}</div>
      ${safeSub ? `<div class="map-card__sub">${safeSub}</div>` : ""}
    </div>
  `;
}

/** InfoWindow (상세 + CTA) */
export function buildInfoWindowHTML({
  type,
  title,
  desc,      // optional: 간단 설명(예: "스마트 쉼터", "전동보장구 급속충전소")
  rows = [], // [{label, value}]
  cta,       // { text: "경유지로 사용", action: "use-pass", payload: "..."}  (action은 data-action)
}) {
  const b = getTypeBadge(type);

  const safeTitle = esc(title || "이름 없음");
  const safeDesc = desc ? esc(desc) : "";

  const rowsHTML = rows
    .map((r) => kvRow(r.label, r.value))
    .filter(Boolean)
    .join("");

  const ctaHTML = cta
    ? `
      <button class="btn btn--cta" type="button"
        data-action="${esc(cta.action)}"
        data-payload="${esc(cta.payload ?? "")}">
        ${esc(cta.text || "경유지로 사용")}
      </button>
    `
    : "";

  return `
    <div class="map-card map-card--info" role="dialog" aria-label="시설 상세 정보">
      <div class="map-card__header">
        <div class="map-card__head-left">
          <span class="${b.className}">
            <span class="badge__icon">${b.icon}</span>
            <span class="badge__text">${esc(b.text)}</span>
          </span>
          <div class="map-card__title map-card__title--lg">${safeTitle}</div>
          ${safeDesc ? `<div class="map-card__desc">${safeDesc}</div>` : ""}
        </div>
      </div>

      ${rowsHTML ? `<div class="map-card__kv">${rowsHTML}</div>` : ""}

      ${ctaHTML ? `<div class="map-card__actions">${ctaHTML}</div>` : ""}
    </div>
  `;
}

/** InfoWindow 내부 버튼 이벤트를 위임으로 처리할 때 도움: payload를 JSON으로 넣고 싶으면 */
export function encodePayload(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}
