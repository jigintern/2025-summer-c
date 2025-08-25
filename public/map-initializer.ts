/**
 * @file Leafletマップの初期化と描画関連の機能を設定します。
 * このファイルは、マップの基本的な設定、タイルレイヤー、描画コントロール、およびカスタム情報ボックスの追加を行います。
 */

import {
  LeafletMap,
  LeafletLatLngBounds,
  LeafletGlobal,
  LeafletDrawEvent,
  LeafletRectangle,
  LeafletLayerGroup,
  LeafletControl,
  LeafletEvent
} from "../types/leaflet.ts";

// Leaflet.jsから提供されるグローバルなLオブジェクト。
declare const L: LeafletGlobal;

/**
 * Leafletマップを初期化し、指定されたHTML要素にマウントします。
 * @param {string} mapid - マップをマウントするHTML要素のID。
 * @param {(bounds: LeafletLatLngBounds) => Promise<boolean>} onShapeCreated - ユーザーが図形を描画したときに呼び出されるコールバック関数。
 * @returns {LeafletMap} 初期化されたLeafletマップのインスタンス。
 */
export function initMap(mapid: string, onShapeCreated: (bounds: LeafletLatLngBounds) => Promise<boolean>): LeafletMap {
	const map: LeafletMap = L.map(mapid, {
		maxZoom: 18,
		center: [35.943, 136.188]
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  /** マーカーや情報ボックスを保持するための専用レイヤーグループ。 */
	map.markerLayer = L.layerGroup();
	map.markerLayer.addTo(map);

  /**
   * マップに情報ボックス（矩形とツールチップ）を追加するカスタムメソッド。
   * @param data - 表示する情報を含むデータオブジェクト。
   * @returns {LeafletRectangle} 作成された矩形レイヤー。
   */
	map.addInfoBox = function(data: {
    lat1: number; lng1: number; lat2: number; lng2: number;
    posterName: string; era: string; bodyText: string;
  }): LeafletRectangle {
		const bounds: [[number, number], [number, number]] = [[data.lat1, data.lng1], [data.lat2, data.lng2]];

		const rect: LeafletRectangle = L.rectangle(bounds, {
			color: "#0033ff",
			weight: 2,
			fillOpacity: 0.1
		});

		const content = `
			<div class="info-box">
				<h3>投稿者: ${data.posterName}</h3>
				<p><strong>年代:</strong> ${data.era}</p>
				<p>${data.bodyText.replace(/\n/g, '<br>')}</p>
			</div>
		`;

		rect.bindTooltip(content, {
			permanent: true,
			direction: 'center',
			className: 'info-tooltip'
		});

		this.markerLayer.addLayer(rect);
		return rect;
	};

  /** ユーザーによって描画された図形を保持するレイヤーグループ。 */
	const drawnItems: LeafletLayerGroup = new L.FeatureGroup();
	map.addLayer(drawnItems);

  /** Leaflet.drawプラグインの描画コントロール。 */
	const drawControl: LeafletControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItems
		},
		draw: {
			polygon: false,
			polyline: false,
			circle: false,
			marker: false,
			circlemarker: false,
			rectangle: {
				shapeOptions: {
					color: '#007bff'
				}
			}
		}
	});
	map.addControl(drawControl);

  // ユーザーが図形を描画し終えたときのイベントリスナー
	map.on(L.Draw.Event.CREATED, async (event: LeafletEvent) => {
        const drawEvent = event as LeafletDrawEvent;
		if (drawEvent.layerType === 'rectangle') {
            const layer = drawEvent.layer;
            // レイヤーをすぐにdrawnItemsグループに追加して可視化する
            drawnItems.addLayer(layer);

			const bounds = layer.getBounds();
            // モーダル操作の結果を待つ
            const success = await onShapeCreated(bounds);

            // ユーザーがキャンセルした場合、先ほど追加したレイヤーを削除する
            if (!success) {
                drawnItems.removeLayer(layer);
            }
		}
	});

	return map;
}
