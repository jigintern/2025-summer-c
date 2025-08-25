"use strict";

import { initMap } from "./map-initializer.js";

let mapData = [];

// ================== DOM要素取得 ==================
//const saveButton = document.getElementById("saveButton");
const modal = document.getElementById("infoModal");
const submitInfoButton = document.getElementById("submitInfo");
const cancelInfoButton = document.getElementById("cancelInfo");
const posterNameInput = document.getElementById("posterName");
const eraInput = document.getElementById("era");
const bodyTextInput = document.getElementById("bodyText");
const boundsDisplay = document.getElementById("map-bounds-display"); // ★修正点1: これを追加

// ================== 関数定義 ==================

/**
 * マップの表示範囲を更新する関数
 */
function updateBoundsDisplay() {
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
 * データ保存
 */
async function saveData() {
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
async function loadData() {
  try {
    const response = await fetch("/api/load-data");
    if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
    const loadedData = await response.json();
    if (Array.isArray(loadedData)) {
      mapData = loadedData;
      renderMap();
      console.log("データ読み込み成功");
    }
  } catch (error) {
    console.error("読み込み失敗:", error);
  }
}

/**
 * マップ再描画
 */
function renderMap() {
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
function showInfoModal() {
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
async function handleShapeCreated(bounds) {
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
    renderMap();
  }
}

// ================== 初期化処理 ==================
const map = initMap("map", handleShapeCreated);
map.setView([35.943, 136.188], 15);

// イベントリスナーを設定
map.on("moveend", updateBoundsDisplay);
//saveButton.addEventListener("click", saveData);

// 初期データを読み込み、初期の範囲を表示
loadData();
updateBoundsDisplay(); // ★修正点2: これを追加