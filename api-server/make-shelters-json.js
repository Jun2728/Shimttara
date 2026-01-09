import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function toNum(v) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function norm(v) {
  return String(v ?? "").trim();
}

function classifyType(row) {
  const a = norm(row["시설구분2"]).toLowerCase();
  const b = norm(row["시설구분1"]).toLowerCase();
  const c = norm(row["시설유형"]).toLowerCase();
  const s = `${a} ${b} ${c}`;

  if (s.includes("스마트")) return "SMART";
  if (s.includes("한파")) return "COLD";
  if (s.includes("무더위") || s.includes("폭염")) return "HEAT";
  return "SHELTER";
}

function makeId(i, row) {
  const name = norm(row["쉼터명칭"]);
  const road = norm(row["도로명주소"]);
  const jibun = norm(row["지번주소"]);
  const base = (name + "|" + (road || jibun)).replace(/\s+/g, "");
  return `sd-${i + 1}-${base.slice(0, 24)}`;
}

function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3] || "./shelters.seongdong.json";

  if (!inPath) {
    console.error("Usage: node make-shelters-json.js <input.csv> <output.json>");
    process.exit(1);
  }

  const csv = fs.readFileSync(inPath, "utf-8");

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });

  const result = [];
  const dropped = { inactive: 0, noCoords: 0 };

  records.forEach((row, i) => {
    const used = norm(row["사용여부"]).toUpperCase();
    if (used && used !== "Y") {
      dropped.inactive++;
      return;
    }

    const lat = toNum(row["위도"]);
    const lng = toNum(row["경도"]);
    if (lat === null || lng === null) {
      dropped.noCoords++;
      return;
    }

    result.push({
      id: makeId(i, row),
      name: norm(row["쉼터명칭"]),
      roadAddress: norm(row["도로명주소"]),
      jibunAddress: norm(row["지번주소"]),
      lat,
      lng,
      type: classifyType(row),
    });
  });

  result.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

  console.log("✅ CSV rows:", records.length);
  console.log("✅ Output rows:", result.length);
  console.log("📦 Saved:", path.resolve(outPath));
}

main();
