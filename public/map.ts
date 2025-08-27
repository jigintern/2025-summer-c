/**
 * @file マップアプリケーションのクライアントサイドの主要なロジックを実装します。
 * これには、マップの初期化、ユーザーインタラクションの処理、サーバーとのデータ同期などが含まれます。
 */

"use strict";

import { initMap } from "./map-initializer.ts";
import { MapDataInfo } from "../types/map.ts";
import { LeafletMap, LeafletLayer, LeafletGlobal } from "../types/leaflet.ts";
import { postJson, queryJson } from "../utils/api.ts";
import { PostSubmission } from "../types/postData.ts";

// Leaflet.jsから提供されるグローバルなLオブジェクト。
declare const L: LeafletGlobal;

// ================== DOM要素取得 ==================
/** ユーザーインターフェースのモーダルウィンドウ要素。 */
const modal = document.getElementById("infoModal") as HTMLElement & { clear: () => void; };
/** ドロワー */
const drawerComponent = document.getElementById("drawer") as HTMLElement & {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

// ================== 関数定義 ==================

/**
 * サーバーから地図データを非同期で読み込み、マップを再描画します。
 */
async function loadAndRenderData(): Promise<void> {
    try {
        // クエリの範囲を全世界に広げて、すべてのデータを取得するようにします
        const posts = await queryJson({ year: new Date().getFullYear(), x: -180, y: -90, x2: 180, y2: 90 });
        map.markerLayer.clearLayers();
        posts.forEach(post => {
            map.addInfoBox(post);
        });
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
}

/**
 * ユーザーからの情報入力を求めるモーダルウィンドウを表示します。
 * @returns {Promise<MapDataInfo | null>} ユーザーが情報を入力して決定した場合はその情報を、キャンセルした場合はnullを解決するPromise。
 */
function showInfoModal(): Promise<MapDataInfo | null> {
    modal.clear();
    modal.style.display = "block";

    return new Promise((resolve) => {
        const onSubmit = (e: Event) => {
            const customEvent = e as CustomEvent;
            cleanup();
            resolve(customEvent.detail);
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const cleanup = () => {
            modal.style.display = "none";
            modal.removeEventListener("submit", onSubmit);
            modal.removeEventListener("cancel", onCancel);
            drawerComponent.close();
        };

        modal.addEventListener("submit", onSubmit, { once: true });
        modal.addEventListener("cancel", onCancel, { once: true });
    });
}

/**
 * ユーザーがマップ上に新しい図形を描画した際の処理を行います。
 * @param {LeafletLayer} layer - 描画された図形レイヤー。
 * @returns {Promise<boolean>} ユーザーが情報を入力し、データが正常に追加された場合はtrue、キャンセルされた場合はfalseを解決するPromise。
 */
async function handleShapeCreated(layer: LeafletLayer): Promise<boolean> {
    drawerComponent.open()
    const info = await showInfoModal();
    if (info && 'era' in info) {
        const eraParts = (info.era as string).split('-');
        if (eraParts.length !== 2) {
            alert("時代の入力形式が正しくありません。例: '1980-1990' のように入力してください。");
            return false;
        }

        const gt = parseInt(eraParts[0], 10);
        const lte = parseInt(eraParts[1], 10);

        if (Number.isNaN(gt) || Number.isNaN(lte)) {
            alert("時代の入力形式が正しくありません。例: '1980-1990' のように入力してください。");
            return false;
        }

        const submission: PostSubmission = {
            name: info.posterName,
            geometry: layer.toGeoJSON(),
            decade: { gt, lte },
            comment: info.bodyText,
            photos: [],
            thread: [],
            created_at: new Date().toISOString(),
        };

        try {
            const response = await postJson(submission);
            if (response.ok) {
                map.addInfoBox(submission);
                return true;
            } else {
                console.error("Failed to save data", await response.text());
                alert("データの保存に失敗しました。");
                return false;
            }
        } catch (error) {
            console.error("Error posting data", error);
            alert("データの送信中にエラーが発生しました。");
            return false;
        }
    }
    return false;
}

// ================== 初期化処理 ==================
/** Leafletマップのインスタンス。 */
const map: LeafletMap = initMap("map", handleShapeCreated);
map.setView([35.943, 136.188], 15);

// 初期データを一度だけ、全範囲で読み込む
loadAndRenderData();

// ================== カスタム描画コントロール ==================
const drawRectangleButton = document.getElementById('draw-rectangle') as HTMLButtonElement;
const drawPolygonButton = document.getElementById('draw-polygon') as HTMLButtonElement;
const drawCircleButton = document.getElementById('draw-circle') as HTMLButtonElement;

const rectangleDrawer = new L.Draw.Rectangle(map);
const polygonDrawer = new L.Draw.Polygon(map);
const circleDrawer = new L.Draw.Circle(map);

drawRectangleButton.addEventListener('click', () => rectangleDrawer.enable());
drawPolygonButton.addEventListener('click', () => polygonDrawer.enable());
drawCircleButton.addEventListener('click', () => circleDrawer.enable());
