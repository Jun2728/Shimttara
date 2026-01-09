// /src/core/state.js

export const state = {
    // ✅ 모드
    ROUTE_MODE: "NORMAL", // "NORMAL" | "COLD" | "HEAT"
    SHOW_MODE_WIDGET: false,
  
    // DOM
    dom: {},
  
    // Map / Info
    map: null,
    infoWindow: null,
    hoverOverlay: null,
    pickMode: false,
  
    // Data
    sheltersList: [],
    shelterMarkers: [],
  
    mobilityStations: [],
    mobilityMarkers: [],
  
    toiletsList: [],
    toiletMarkers: [],
  
    // Route
    startPos: null,
    endPos: null,
    endLabel: "",
    lastRouteKey: "",
  
    startMarker: null,
    endMarker: null,
    baseLine: null,
  
    passMarker: null,
    pickedShelter: null, // {name,lat,lng,pickedBy,type}
  
    // My location marker (출발 아님)
    myMarker: null,
  
    // Layer toggles
    LAYER: {
      smart: true,
      shelter: true,
      toilet: false,
      mobility: false,
    },
  };
  