// types/leaflet.ts

// Leafletレイヤーの最小限の定義
export interface LeafletLayer {
  addTo(map: LeafletMap): this;
  bindTooltip(content: string, options: object): this;
}

// L.LayerGroupの最小限の定義
export interface LeafletLayerGroup extends LeafletLayer {
  clearLayers(): this;
  addLayer(layer: LeafletLayer): this;
  removeLayer(layer: LeafletLayer): this; // この行を追加
}

// L.Rectangleの最小限の定義
export interface LeafletRectangle extends LeafletLayer {
    getBounds(): LeafletLatLngBounds;
}

/** L.Mapの最小限の定義 */
export interface LeafletMap {
  getBounds(): LeafletLatLngBounds;
  getZoom(): number;
  hasLayer(layer: LeafletLayer): boolean;
  removeLayer(layer: LeafletLayer): this;
  addLayer(layer: LeafletLayer | LeafletLayerGroup): this;
  setView(center: [number, number], zoom: number): this;
  on(type: string, fn: (event: LeafletEvent) => void): this;
  addControl(control: LeafletControl): this;

  // map-initializer.ts で追加されたカスタムプロパティ
  markerLayer: LeafletLayerGroup;
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

/** L.LatLngの最小限の定義 */
export interface LeafletLatLng {
  lat: number;
  lng: number;
}

/** L.LatLngBoundsの最小限の定義 */
export interface LeafletLatLngBounds {
  getSouthWest(): LeafletLatLng;
  getNorthEast(): LeafletLatLng;
}

// 一般的なイベント
export interface LeafletEvent {
    // Leafletイベントの基本プロパティ
}

// 描画作成時の特定のイベント
export interface LeafletDrawEvent extends LeafletEvent {
  layer: LeafletRectangle;
  layerType: string;
}

// Leafletコントロールの最小限の定義
export interface LeafletControl {
    // コントロールの基本
}

// グローバルなLオブジェクトの最小限の定義
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
