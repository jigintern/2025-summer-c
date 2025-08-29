// types/leaflet.ts
import { PostSubmission } from "./postData.ts";
import {GeoJSON} from "npm:@types/geojson@7946.0.16";

// Leafletレイヤーの最小限の定義
export interface LeafletLayer {
  addTo(map: LeafletMap): this;
  bindTooltip(content: string, options: object): this;
  getBounds(): LeafletLatLngBounds;
  toGeoJSON(): GeoJSON;
}

// L.LayerGroupの最小限の定義
export interface LeafletLayerGroup extends LeafletLayer {
	clearLayers(): this;
	addLayer(layer: LeafletLayer): this;
	removeLayer(layer: LeafletLayer): this;
}

// L.Rectangleの最小限の定義
export interface LeafletRectangle extends LeafletLayer {
    on(click: string, param2: () => void): void;
}

/** L.Mapの最小限の定義 */
export interface LeafletMap {
	getBounds(): LeafletLatLngBounds;
	getZoom(): number;
	hasLayer(layer: LeafletLayer): boolean;
	removeLayer(layer: LeafletLayer): this;
	addLayer(layer: LeafletLayer | LeafletLayerGroup): this;
	setView(center: [number, number], zoom: number, option?: object): this;
	on(type: string, fn: (event: LeafletEvent) => void): this;
	addControl(control: LeafletControl): this;

	// map-initializer.ts で追加されたカスタムプロパティ
	markerLayer: LeafletLayerGroup;
	drawnItems: LeafletLayerGroup; // 追加
	addInfoBox: (data: PostSubmission) => LeafletRectangle;

	fitBounds(bounds: LeafletLatLngBounds): void;

    getBoundsZoom(bounds: LeafletLatLngBounds, b: boolean): number;

    project(nw: LeafletLatLng, zoom: number): any;

    getSize(): any;

    unproject(centerPixel: any, zoom: number): any;

    setMaxBounds(worldBounds: any): void;
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

    getNorthWest(): LeafletLatLng;

    getNorth(): any;

    getSouth(): any;

    getEast(): any;

    getWest(): any;
}

// 一般的なイベント
export interface LeafletEvent {
	// Leafletイベントの基本プロパティ
}

// 描画作成時の特定のイベント
export interface LeafletDrawEvent extends LeafletEvent {
	layer: LeafletLayer;
	layerType: string;
}

// Leafletコントロールの最小限の定義
export interface LeafletControl {
	// コントロールの基本
}

// 描画ハンドラのインターフェース
export interface LeafletDrawer {
	enable(): void;
}

// L.Drawのツールを定義
export interface LeafletDrawTools {
	Rectangle: new (map: LeafletMap, options?: object) => LeafletDrawer;
	Polygon: new (map: LeafletMap, options?: object) => LeafletDrawer;
	Circle: new (map: LeafletMap, options?: object) => LeafletDrawer;
}

// L.Drawのイベントとツールを結合
export type LeafletDraw = LeafletDrawTools & {
	Event: {
		CREATED: string;
	};
};

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
    Draw: LeafletDraw;
    geoJSON(geojson?: GeoJSON, options?: object): LeafletLayerGroup;

    point(number: number, number2: number): any;

    latLngBounds(latLng: any, latLng2: any): any;

    latLng(number: number, number2: number): any;
}
