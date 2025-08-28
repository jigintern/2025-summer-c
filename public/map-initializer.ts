/**
 * @file Leafletマップの初期化と描画関連の機能を設定します。
 * このファイルは、マップの基本的な設定、タイルレイヤー、描画コントロール、およびカスタム情報ボックスの追加を行います。
 */

import {
  LeafletMap,
  LeafletGlobal,
  LeafletDrawEvent,
  LeafletEvent,
  LeafletLayer
} from "../types/leaflet.ts";
import { PostSubmission } from "../types/postData.ts";

// Leaflet.jsから提供されるグローバルなLオブジェクト。
declare const L: LeafletGlobal;

/**
 * Leafletマップを初期化し、指定されたHTML要素にマウントします。
 * @param {string} mapid - マップをマウントするHTML要素のID。
 * @param {(layer: LeafletLayer) => Promise<boolean>} onShapeCreated - ユーザーが図形を描画したときに呼び出されるコールバック関数。
 * @returns {LeafletMap} 初期化されたLeafletマップのインスタンス。
 */
export function initMap(mapid: string, onShapeCreated: (layer: LeafletLayer) => Promise<boolean>): LeafletMap {
	const map: LeafletMap = L.map(mapid, {
		maxZoom: 22,
		center: [35.943, 136.188]
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
    maxZoom: 22,
    minZoom: 5,
  }).addTo(map);

  /** マーカーや情報ボックスを保持するための専用レイヤーグループ。 */
	map.markerLayer = L.layerGroup();
	map.markerLayer.addTo(map);

  /**
   * マップに情報ボックス（図形とツールチップ）を追加するカスタムメソッド。
   * @param data - 表示する情報を含むデータオブジェクト。
   * @returns {LeafletLayer} 作成されたレイヤー。
   */
	map.addInfoBox = function(data: PostSubmission): LeafletLayer {
    // GeoJSONからレイヤーを作成
		const geoJsonLayer = L.geoJSON(data.geometry, {
      style: {
        color: "#0033ff",
        weight: 2,
        fillOpacity: 0.1
      }
    });

		const content = `
			<div class="info-box">
				<p class="info-content">${data.comment.replace(/\n/g, '<br>')}</p>
				<div class="info-sub-data"><span>${data.name}</span> <span> ${data.decade.gt}-${data.decade.lte}</span></div>
			</div>
		`;

		geoJsonLayer.bindTooltip(content, {
			permanent: true,
			direction: 'center',
			className: 'info-tooltip'
		});

		this.markerLayer.addLayer(geoJsonLayer);
		return geoJsonLayer;
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

        // モーダル操作（データ送信 or キャンセル）を待つ
        await onShapeCreated(layer);

        // 永続的なレイヤーはmarkerLayerに追加されるため、
        // 操作が完了したら、この一時的なレイヤーは常に削除する
        map.drawnItems.removeLayer(layer);
	});

	return map;
}