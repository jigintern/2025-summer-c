

"use strict";

import { initMap } from "./map-initializer.ts";
import { MapDataItem, MapDataInfo } from "../types/map.ts";
import { LeafletMap, LeafletLatLngBounds } from "../types/leaflet.ts";

let mapData: MapDataItem[] = [];

// ================== DOM要素取得 ==================
const modal = document.getElementById("infoModal") as HTMLElement;
const submitInfoButton = document.getElementById("submitInfo") as HTMLButtonElement;
const cancelInfoButton = document.getElementById("cancelInfo") as HTMLButtonElement;
const posterNameInput = document.getElementById("posterName") as HTMLInputElement;
const eraInput = document.getElementById("era") as HTMLInputElement;
const bodyTextInput = document.getElementById("bodyText") as HTMLTextAreaElement;
const boundsDisplay = document.getElementById("map-bounds-display") as HTMLElement;

// ★ 追加点 1: 表示/非表示を切り替えるズームレベルの閾値
const VISIBILITY_ZOOM_THRESHOLD = 15;

// ================== 関数定義 ==================

/**
 * マップの表示範囲を更新する関数
 */
function updateBoundsDisplay(): void {
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const sw_lat = southWest.lat.toFixed(4);
    const sw_lng = southWest.lng.toFixed(4);
    const ne_lat = northEast.lat.toFixed(4);
    const ne_lng = northEast.lng.toFixed(4);

    boundsDisplay.innerHTML = `
    SW: (${sw_lat}, ${sw_lng})<br>
    NE: (${ne_lat}, ${ne_lng})
  `;
}

/**
 * ★ 追加点 2: ズームレベルに応じてレイヤーの表示/非表示を切り替える関数
 */
function updateLayerVisibility(): void {
    const currentZoom = map.getZoom();

    if (currentZoom < VISIBILITY_ZOOM_THRESHOLD) {
        // ズームレベルが閾値未満の場合、レイヤーをマップから削除する
        if (map.hasLayer(map.markerLayer)) {
            map.removeLayer(map.markerLayer);
        }
    } else {
        // ズームレベルが閾値以上の場合、レイヤーをマップに追加する
        if (!map.hasLayer(map.markerLayer)) {
            map.addLayer(map.markerLayer);
        }
    }
}


/**
 * データ保存
 */
async function saveData(): Promise<void> {
    try {
        const response = await fetch("/api/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mapData),
        });
        if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
        console.log("保存成功:", await response.json());
        alert("データをサーバーに保存しました！");
    } catch (error) {
        console.error("保存失敗:", error);
        alert("保存中にエラーが発生しました。");
    }
}

/**
 * データ読み込み
 */
async function loadData(): Promise<void> {
    try {
        const response = await fetch("/api/load-data");
        if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
        const loadedData: MapDataItem[] = await response.json();
        if (Array.isArray(loadedData)) {
            mapData = loadedData;
            renderMap(); // データを元にレイヤーを作成
            updateLayerVisibility(); // ★ 変更点 1: 初期表示時の可視性をチェック
            console.log("データ読み込み成功");
        }
    } catch (error) {
        console.error("読み込み失敗:", error);
    }
}

/**
 * マップ再描画
 */
function renderMap(): void {
    map.markerLayer.clearLayers();
    mapData.forEach((item) => {
        if (item.bounds && item.info) {
            map.addInfoBox({
                lat1: item.bounds.lat1,
                lng1: item.bounds.lng1,
                lat2: item.bounds.lat2,
                lng2: item.bounds.lng2,
                ...item.info,
            });
        }
    });
}

/**
 * モーダル入力
 */
function showInfoModal(): Promise<MapDataInfo | null> {
    posterNameInput.value = "";
    eraInput.value = "";
    bodyTextInput.value = "";
    modal.style.display = "block";

    return new Promise((resolve) => {
        const onDecide = () => {
            cleanup();
            resolve({
                posterName: posterNameInput.value,
                era: eraInput.value,
                bodyText: bodyTextInput.value,
            });
        };
        const onCancel = () => {
            cleanup();
            resolve(null);
        };
        const cleanup = () => {
            modal.style.display = "none";
            submitInfoButton.removeEventListener("click", onDecide);
            cancelInfoButton.removeEventListener("click", onCancel);
        };
        submitInfoButton.addEventListener("click", onDecide, { once: true });
        cancelInfoButton.addEventListener("click", onCancel, { once: true });
    });
}

/**
 * 図形作成イベント
 */
async function handleShapeCreated(bounds: LeafletLatLngBounds): Promise<boolean> {
    const info = await showInfoModal();
    if (info) {
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        mapData.push({
            bounds: {
                lat1: southWest.lat,
                lng1: southWest.lng,
                lat2: northEast.lat,
                lng2: northEast.lng,
            },
            info: info,
        });
        renderMap(); // 再描画
        updateLayerVisibility(); // ★ 追加点 3: 新規作成後も可視性をチェック
        return true;
    }
    return false;
}

// ================== 初期化処理 ==================
const map: LeafletMap = initMap("map", handleShapeCreated);
map.setView([35.943, 136.188], 15);

// イベントリスナーを設定
map.on("moveend", updateBoundsDisplay);
map.on("zoomend", updateLayerVisibility); // ★ 追加点 4: ズーム完了時に表示を更新

// 初期データを読み込み、初期の範囲を表示
loadData();
updateBoundsDisplay();

