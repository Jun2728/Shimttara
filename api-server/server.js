import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const TMAP_APPKEY = process.env.TMAP_APPKEY;

console.log("[api-server] booting... PORT =", PORT, " appKey?", !!TMAP_APPKEY);

if (!TMAP_APPKEY) {
  console.error('[api-server] ERROR: ".env"에 TMAP_APPKEY가 없습니다.');
  process.exit(1);
}

app.get("/ping", (req, res) => res.json({ ok: true, ts: Date.now() }));

/**
 * POST /api/tmap/pedestrian
 * body:
 * {
 *   startLat, startLng, endLat, endLng,
 *   startName?, endName?,
 *   searchOption?,  // 0,4,10,30...
 *   passList?       // "lng,lat_lng,lat" (최대 5곳)
 * }
 */
app.post("/api/tmap/pedestrian", async (req, res) => {
  try {
    const {
      startLat,
      startLng,
      endLat,
      endLng,
      startName = "출발",
      endName = "도착",
      searchOption = 0,
      passList = ""
    } = req.body || {};

    const sLat = Number(startLat), sLng = Number(startLng);
    const eLat = Number(endLat), eLng = Number(endLng);

    if ([sLat, sLng, eLat, eLng].some((v) => Number.isNaN(v))) {
      return res.status(400).json({
        error: "startLat/startLng/endLat/endLng 숫자 값이 필요합니다.",
        got: req.body
      });
    }

    const url = "https://apis.openapi.sk.com/tmap/routes/pedestrian";
    const params = { version: 1 };

    const form = new URLSearchParams();
    form.set("startX", String(sLng)); // X=경도
    form.set("startY", String(sLat)); // Y=위도
    form.set("endX", String(eLng));
    form.set("endY", String(eLat));
    form.set("reqCoordType", "WGS84GEO");
    form.set("resCoordType", "WGS84GEO");
    form.set("startName", startName);
    form.set("endName", endName);
    form.set("searchOption", String(searchOption));
    if (passList && String(passList).trim()) {
      form.set("passList", String(passList).trim());
    }

    const r = await axios.post(url, form.toString(), {
      params,
      headers: {
        appKey: TMAP_APPKEY,
        Accept: "application/json",
        "Accept-Language": "ko",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 15000
    });

    const data = r.data;

    // GeoJSON LineString 좌표만 추출
    const coords = [];
    const features = data?.features || [];
    for (const f of features) {
      if (f?.geometry?.type !== "LineString") continue;
      const arr = f?.geometry?.coordinates || [];
      for (const c of arr) {
        const lng = Number(c?.[0]);
        const lat = Number(c?.[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) coords.push({ lat, lng });
      }
    }

    // totalDistance/totalTime (pointType=SP에서 주로 옴)
    let totalDistance = null;
    let totalTime = null;
    for (const f of features) {
      const p = f?.properties;
      if (!p) continue;
      if (totalDistance == null && typeof p.totalDistance === "number") totalDistance = p.totalDistance;
      if (totalTime == null && typeof p.totalTime === "number") totalTime = p.totalTime;
      if (totalDistance != null && totalTime != null) break;
    }

    return res.json({
      coords,
      meta: { totalDistance, totalTime },
      raw: data
    });
  } catch (err) {
    const detail = err?.response?.data || err?.message || String(err);
    console.error("[api-server] Tmap error:", detail);
    return res.status(500).json({ error: "Tmap 호출 실패", detail });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`- ping: http://localhost:${PORT}/ping`);
});
