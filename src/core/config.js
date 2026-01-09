// /src/core/config.js

export const PATHS = {
    SHELTER_JSON_PATH: "./shelters.seongdong.json",
    MOBILITY_JSON_PATH: "./seongdong_mobility_fast_charging_stations.json",
    TOILET_JSON_PATH: "./seongdong_public_toilets.json",
  };
  
  export const API = {
    API_SERVER: "http://localhost:4000",
  };
  
  // ✅ 데모용 기온(하드코딩)
  export const DEMO_TEMP = {
    NORMAL: 5,
    COLD: -8,
    HEAT: 33,
  };
  
  // ✅ 발표용 고정 경유지(왕십리역 4번 출구) - 임시값
  export const FIXED_PASS_WANGSIMNI_EXIT4 = {
    name: "왕십리역 4번 출구",
    lat: 37.56133,
    lng: 127.03708,
    pickedBy: "fixed",
    type: "SMART",
  };
  
  // ✅ 자주 가는 곳(집)
  export const FAV = {
    home: {
      label: "서울특별시 성동구 행당로11길 6",
      lat: 37.5582699,
      lng: 127.0308033,
    },
  };
  
  // ✅ 도착지 키워드 매핑
  export const DEST_KEYWORDS = {
    성동구청: { label: "성동구청", lat: 37.5634077, lng: 127.0369509 },
    한양대병원: { label: "한양대학교병원", lat: 37.5596577, lng: 127.0441355 },
    "한양대 병원": { label: "한양대학교병원", lat: 37.5596577, lng: 127.0441355 },
  };
  
  // ✅ 내 현재 위치(하드코딩)
  export const MY_POS = { lat: 37.5602343, lng: 127.0337174 };
  