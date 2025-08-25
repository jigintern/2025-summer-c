/**
 * @file マップアプリケーションのクライアントサイドの主要なロジックを実装します。
 * これには、マップの初期化、ユーザーインタラクションの処理、サーバーとのデータ同期などが含まれます。
 */

"use strict";

import { initMap } from "./map-initializer.ts";
import { MapDataItem, MapDataInfo } from "../types/map.ts";
import { LeafletMap, LeafletLatLngBounds } from "../types/leaflet.ts";

/** アプリケーションで扱う地図データの配列。サーバーとの間で送受信される。 */
let mapData: MapDataItem[] = [];

// ================== DOM要素取得 ==================
/** ユーザーインターフェースのモーダルウィンドウ要素。 */
const modal = document.getElementById("infoModal") as HTMLElement;
/** モーダル内の情報送信ボタン。 */
const submitInfoButton = document.getElementById("submitInfo") as HTMLButtonElement;
/** モーダル内のキャンセルボタン。 */
const cancelInfoButton = document.getElementById("cancelInfo") as HTMLButtonElement;
/** 投稿者名を入力するテキストフィールド。 */
const posterNameInput = document.getElementById("posterName") as HTMLInputElement;
/** 年代を入力するテキストフィールド。 */
const eraInput = document.getElementById("era") as HTMLInputElement;
/** 本文を入力するテキストエリア。 */
const bodyTextInput = document.getElementById("bodyText") as HTMLTextAreaElement;
/** マップの境界座標を表示するHTML要素。 */
const boundsDisplay = document.getElementById("map-bounds-display") as HTMLElement;

/** 情報レイヤーの表示/非表示を切り替えるズームレベルの閾値。 */
const VISIBILITY_ZOOM_THRESHOLD = 15;

// ================== 関数定義 ==================

/**
 * 現在のマップ表示範囲の座標をHTML要素に表示します。
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
 * 現在のズームレベルに応じて情報レイヤーの表示/非表示を切り替えます。
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
 * 現在の地図データ (mapData) をサーバーに非同期で保存します。
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
 * サーバーから地図データを非同期で読み込み、マップを再描画します。
 */
async function loadData(): Promise<void> {
    try {
        const response = await fetch("/api/load-data");
        if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
        const loadedData: MapDataItem[] = await response.json();
        if (Array.isArray(loadedData)) {
            mapData = loadedData;
            renderMap(); // データを元にレイヤーを作成
            updateLayerVisibility(); // 初期表示時の可視性をチェック
            console.log("データ読み込み成功");
        }
    } catch (error) {
        console.error("読み込み失敗:", error);
    }
}

/**
 * 現在の `mapData` 配列の内容に基づいて、マップ上の情報ボックスを再描画します。
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
 * ユーザーからの情報入力を求めるモーダルウィンドウを表示します。
 * @returns {Promise<MapDataInfo | null>} ユーザーが情報を入力して決定した場合はその情報を、キャンセルした場合はnullを解決するPromise。
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
 * ユーザーがマップ上に新しい矩形を描画した際の処理を行います。
 * @param {LeafletLatLngBounds} bounds - 描画された矩形の地理的境界。
 * @returns {Promise<boolean>} ユーザーが情報を入力し、データが正常に追加された場合はtrue、キャンセルされた場合はfalseを解決するPromise。
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
        updateLayerVisibility(); // 新規作成後も可視性をチェック
        return true;
    }
    return false;
}

// ================== 初期化処理 ==================
/** Leafletマップのインスタンス。 */
const map: LeafletMap = initMap("map", handleShapeCreated);
map.setView([35.943, 136.188], 15);

// イベントリスナーを設定
map.on("moveend", updateBoundsDisplay);
map.on("zoomend", updateLayerVisibility); // ズーム完了時に表示を更新

// 初期化処理の実行
loadData();
updateBoundsDisplay();
