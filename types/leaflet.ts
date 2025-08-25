// types/leaflet.ts

// A minimal definition for a Leaflet Layer
export interface LeafletLayer {
  addTo(map: LeafletMap): this;
  bindTooltip(content: string, options: object): this;
}

// A minimal definition for L.LayerGroup
export interface LeafletLayerGroup extends LeafletLayer {
  clearLayers(): this;
  addLayer(layer: LeafletLayer): this;
}

// A minimal definition for L.Rectangle
export interface LeafletRectangle extends LeafletLayer {
    getBounds(): LeafletLatLngBounds;
}

/** A minimal definition for L.Map */
export interface LeafletMap {
  getBounds(): LeafletLatLngBounds;
  getZoom(): number;
  hasLayer(layer: LeafletLayer): boolean;
  removeLayer(layer: LeafletLayer): this;
  addLayer(layer: LeafletLayer | LeafletLayerGroup): this;
  setView(center: [number, number], zoom: number): this;
  on(type: string, fn: (event: LeafletEvent) => void): this;
  addControl(control: LeafletControl): this;

  // Custom properties added in map-initializer.js
  markerLayer: LeafletLayerGroup;
  drawnItems: LeafletLayerGroup; // For holding user-drawn shapes
  addInfoBox: (data: {
    lat1: number;
    lng1: number;
    lat2: number;
    lng2: number;
    posterName: string;
    era: string;
    bodyText: string;
  }) => LeafletRectangle;
}

/** A minimal definition for L.LatLng */
export interface LeafletLatLng {
  lat: number;
  lng: number;
}

/** A minimal definition for L.LatLngBounds */
export interface LeafletLatLngBounds {
  getSouthWest(): LeafletLatLng;
  getNorthEast(): LeafletLatLng;
}

// Generic event
export interface LeafletEvent {
    // Base properties for leaflet events
}

// Specific event for draw creation
export interface LeafletDrawEvent extends LeafletEvent {
  layer: LeafletRectangle;
  layerType: string;
}

// A minimal definition for a Leaflet Control
export interface LeafletControl {
    // Base for controls
}

// A minimal definition for the global L object
export interface LeafletGlobal {
    map(id: string, options: object): LeafletMap;
    tileLayer(url: string, options: object): LeafletLayer;
    layerGroup(): LeafletLayerGroup;
    rectangle(bounds: [[number, number], [number, number]], options: object): LeafletRectangle;
    FeatureGroup: new () => LeafletLayerGroup;
    Control: {
        Draw: new (options: object) => LeafletControl;
    };
    Draw: {
        Event: {
            CREATED: string;
        }
    };
}
