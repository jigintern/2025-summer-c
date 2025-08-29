/**
 * @file Leafletマップの初期化と描画関連の機能を設定します。
 * @description マップの基本的な設定、タイルレイヤー、描画コントロール、
 * および自己交差ポリゴンを自動修正する機能を提供します。
 */

// --- 外部モジュールのインポート ---
// 自己交差ポリゴンを修正するためのTurf.jsモジュール
import unkinkPolygon from 'npm:@turf/unkink-polygon@7.0.0';

// --- 型定義のインポート ---
// GeoJSONの型。Turf.jsやLeafletのGeoJSON機能で利用します。
import type { Feature, Polygon, MultiPolygon } from 'geojson';
// Leaflet関連のカスタム型定義
import type {
    LeafletMap,
    LeafletGlobal,
    LeafletDrawEvent,
    LeafletEvent,
    LeafletLayer,
    Path
} from "../types/leaflet.ts";
// 投稿データの型定義
import type { PostSubmission } from "../types/postData.ts";


// --- グローバル変数の宣言 ---
// Leaflet.jsライブラリがグローバルに提供する 'L' オブジェクトの型を宣言します。
declare const L: LeafletGlobal;


/**
 * Leafletマップを初期化し、描画機能やカスタムメソッドをセットアップします。
 *
 * @param mapId - マップを描画するHTML要素のID。
 * @param onShapeCreated - ユーザーが図形を描画完了した際に呼び出されるコールバック関数。
 * @returns 初期化済みのLeafletマップインスタンス。
 */
export function initMap(mapId: string, onShapeCreated: (layer: LeafletLayer) => Promise<boolean>): LeafletMap {

    // --- マップの基本設定 ---
    const map: LeafletMap = L.map(mapId, {
        maxZoom: 22,
        center: [35.943, 136.188] // 福井県鯖江市周辺の座標
    });

    // --- タイルレイヤーの設定 ---
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 22,
        minZoom: 5,
    }).addTo(map);

    // --- レイヤーグループの初期化 ---
    // 投稿データを表示するための永続的なレイヤーグループ
    map.markerLayer = L.layerGroup();
    map.markerLayer.addTo(map);

    // ユーザーが描画した図形を一時的に表示するためのレイヤーグループ
    map.drawnItems = new L.FeatureGroup();
    map.addLayer(map.drawnItems);


    // --- カスタムメソッドの追加 ---
    /**
     * 投稿データからGeoJSONレイヤーを作成し、情報ツールチップを付けてマップに追加します。
     * @param data - 表示する投稿データ。
     * @returns 作成されたLeafletレイヤー。
     */
    map.addInfoBox = function(data: PostSubmission): LeafletLayer {
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
             <div class="info-sub-data">
                <span>${data.name}</span>
                <span>${data.decade.gt}-${data.decade.lte}</span>
             </div>
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


    // --- イベントリスナーの設定 ---
    /**
     * ユーザーによる図形の描画が完了したときのイベントを処理します。
     * ポリゴンが自己交差している場合（砂時計型など）、自動的に複数の単純なポリゴンに分割します。
     */
    map.on(L.Draw.Event.CREATED, async (event: LeafletEvent) => {
        const { layer, layerType } = event as LeafletDrawEvent;

        // 後続の処理に渡す最終的なレイヤー（単一またはグループ）
        let finalLayer: LeafletLayer = layer;

        // 描画されたのがポリゴンだった場合に自己交差チェックを行う
        if (layerType === 'polygon' && typeof layer.toGeoJSON === 'function') {
            //console.log("ポリゴンが描画されました。自己交差をチェックします...");

            const geojson = layer.toGeoJSON() as Feature<Polygon | MultiPolygon>;
            const unkinked = unkinkPolygon(geojson);

            // ポリゴンが複数の単純なポリゴンに分割された場合
            if (unkinked.features.length > 1) {
                //console.log(`ポリゴンが ${unkinked.features.length} 個の単純な図形に分割されました。`);

                // 分割された各ポリゴンを描画するための新しいレイヤー群を作成
                // このとき、元のレイヤーのスタイル（色や太さ）を引き継ぐ
                const newLayers = unkinked.features.map(feature =>
                    L.geoJSON(feature, {
                        style: (layer as Path).options
                    })
                );

                // 新しいレイヤー群を一つのグループとしてまとめる
                finalLayer = L.featureGroup(newLayers);
            } else {
                //console.log("ポリゴンは自己交差していません。");
            }
        }

        // 最終的なレイヤーを一時レイヤーとしてマップに追加
        map.drawnItems.addLayer(finalLayer);

        // データの保存や入力モーダルの表示など、メインの処理を呼び出す
        await onShapeCreated(finalLayer);

        // メイン処理が完了したら、一時的なレイヤーをマップから削除
        map.drawnItems.removeLayer(finalLayer);
    });

    return map;
}