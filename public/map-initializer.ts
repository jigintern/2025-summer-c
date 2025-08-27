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
  LeafletEvent
} from "../types/leaflet.ts";
import { PostSubmission } from "../types/postData.ts";

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
		maxZoom: 22,
		center: [35.943, 136.188]
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(map);

  /** マーカーや情報ボックスを保持するための専用レイヤーグループ。 */
	map.markerLayer = L.layerGroup();
	map.markerLayer.addTo(map);

  /**
   * マップに情報ボックス（矩形とツールチップ）を追加するカスタムメソッド。
   * @param data - 表示する情報を含むデータオブジェクト。
   * @returns {LeafletRectangle} 作成された矩形レイヤー。
   */
	map.addInfoBox = function(data: PostSubmission): LeafletRectangle {
		const { y, x, h, w } = data.coordinate;
        const bounds: [[number, number], [number, number]] = [[y, x], [y + h, x + w]];

		const rect: LeafletRectangle = L.rectangle(bounds, {
			color: "#0033ff",
			weight: 2,
			fillOpacity: 0.1
		});

		const content = `
			<div class="info-box">
				<p class="info-content">${data.comment.replace(/\n/g, '<br>')}</p>
				<div class="info-sub-data"><span>${data.name}</span> <span> ${data.decade.gt}-${data.decade.lte}</span></div>
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

  /** ユーザーによって描画された図形を一時的に保持するレイヤーグループ。 */
	map.drawnItems = new L.FeatureGroup();
	map.addLayer(map.drawnItems);

  // ユーザーが図形を描画し終えたときのイベントリスナー
	map.on(L.Draw.Event.CREATED, async (event: LeafletEvent) => {
        const drawEvent = event as LeafletDrawEvent;
        const layer = drawEvent.layer;

        // レイヤーを一時的にdrawnItemsグループに追加して可視化する
        map.drawnItems.addLayer(layer);

        const bounds = layer.getBounds();
        // モーダル操作（データ送信 or キャンセル）を待つ
        await onShapeCreated(bounds);

        // 永続的なレイヤーはmarkerLayerに追加されるため、
        // 操作が完了したら、この一時的なレイヤーは常に削除する
        map.drawnItems.removeLayer(layer);
	});

	return map;
}