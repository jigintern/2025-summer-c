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
const infoModal = document.getElementById("infoModal") as HTMLElement & { clear: () => void; };
const commentModal = document.getElementById("commentModal") as HTMLElement & {
    clear: () => void;
    setItemId: (s:string) => void;
}
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
        const posts = await queryJson({ year: -1, x: -180, y: -90, x2: 180, y2: 90 });
        map.markerLayer.clearLayers();
        posts.forEach(post => {
            const layer = map.addInfoBox(post);

            // 領域クリック時のイベントリスナーを追加
            layer.on('click', (e) => {
                // クリックイベントの伝播を停止（マップのクリックイベントを発火させない）
                // L.DomEvent.stopPropagation(e);

                // カスタムイベントを発火させる
                // const customEvent = new CustomEvent('area-clicked', {
                //     bubbles: true,
                //     composed: true,
                //     detail: { post, layer, event: e }
                // });
                // document.dispatchEvent(customEvent);

                // あるいは直接処理を実行することもできます
                handleAreaClick(post, layer, e);
            });
        });
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
}

/**
 * 領域がクリックされたときの処理
 * @param post 領域に関連するデータ
 * @param layer クリックされたレイヤー
 * @param event クリックイベント
 */
async function handleAreaClick(post: PostSubmission, layer: LeafletLayer, event: LeafletEvent): void {
    console.log('領域がクリックされました:', post);

    // 例：ドロワーを開いて詳細情報を表示
    drawerComponent.open();
    const info = await showInfoModal(post["id"]);


    // 例：詳細情報を表示するためのモーダルウィンドウを表示
    // showInfoModal(post.id).then(info => {
    //     if (info) {
    //         // 何か処理...
    //     }
    // });
}


/**
 * ユーザーからの情報入力を求めるモーダルウィンドウを表示します。
 * @param {string | null} itemId - 既存のアイテムIDがある場合に指定します。コメントモード用。
 * @returns {Promise<MapDataInfo | null>} ユーザーが情報を入力して決定した場合はその情報を、キャンセルした場合はnullを解決するPromise。
 */
function showInfoModal(itemId: string | null = null): Promise<MapDataInfo | null> {
    let modal = infoModal;
    // コメントモードの場合
    console.log(itemId)
    if (itemId !== null) {
        modal = commentModal;
        modal.setItemId(itemId);
    }
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
export const map: LeafletMap = initMap("map", handleShapeCreated);

// マップの移動範囲を全世界に制限
const worldBounds = L.latLngBounds(
    L.latLng(-90, -180), // 南西の角
    L.latLng(90, 180)    // 北東の角
);
map.setMaxBounds(worldBounds);

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

drawRectangleButton.addEventListener('click', () => {
    drawerComponent.close(); // ドロワーを閉じる
    commentModal.clear();
    rectangleDrawer.enable();
});

drawPolygonButton.addEventListener('click', () => {
    drawerComponent.close(); // ドロワーを閉じる
    commentModal.clear();
    polygonDrawer.enable();
});

drawCircleButton.addEventListener('click', () => {
    drawerComponent.close(); // ドロワーを閉じる
    commentModal.clear();
    circleDrawer.enable();
});
