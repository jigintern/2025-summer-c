/**
 * @file マップアプリケーションのクライアントサイドの主要なロジックを実装します。
 * これには、マップの初期化、ユーザーインタラクションの処理、サーバーとのデータ同期などが含まれます。
 */

'use strict';

import {initMap} from "./map-initializer.ts";
import {MapDataInfo} from "../types/map.ts";
import {LeafletGlobal, LeafletLayer, LeafletMap} from "../types/leaflet.ts";
import {postJson, queryJson, postComment, getComments} from "../utils/api.ts";
import {PostSubmission} from "../types/postData.ts";

export  let allPosts: PostSubmission[] = []; // ★ 1. すべての投稿データをここに保持します

// Leaflet.jsから提供されるグローバルなLオブジェクト。
declare const L: LeafletGlobal;

// ================== DOM要素取得 ==================

/** ユーザーインターフェースのモーダルウィンドウ要素。 */
const modal = document.getElementById("infoModal") as HTMLElement & {
    clear: () => void;
    appear: (top: number, left: number) => void;
    close: () => void;
};

// ================== 関数定義 ==================

/**
 * サーバーから地図データを非同期で読み込み、マップを再描画します。
 */
async function loadAndRenderData(): Promise<void> {
    try {
        // クエリの範囲を全世界に広げて、すべてのデータを取得するようにします
        const posts = await queryJson({ year: -1, x: -180, y: -90, x2: 180, y2: 90 });

        allPosts = posts; // ★ 2. 取得したデータを変数に保存

        map.markerLayer.clearLayers();
        posts.forEach(post => {
            const layer = map.addInfoBox(post);
            // 領域クリック時のイベントリスナーを追加
            layer.on('click', (e) => {
                getComments(post["id"]); //テスト用にGETリクエスト
            });
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
    /** ユーザーに領域描画を促す説明の要素 */
    const introduction = document.getElementById('introduction') as HTMLElement;
    // introduction.style.display = "none";
    modal.clear();
    // modal.style.display = "block";

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
            // introduction.style.display = "block";
            modal.style.display = 'none';
            modal.removeEventListener('submit', onSubmit);
            modal.removeEventListener('cancel', onCancel);
            // drawerComponent.close();

        };

        modal.addEventListener('submit', onSubmit, { once: true });
        modal.addEventListener('cancel', onCancel, { once: true });
    });
}

/**
 * ユーザーがマップ上に新しい図形を描画した際の処理を行います。
 * @param {LeafletLayer} layer - 描画された図形レイヤー。
 * @returns {Promise<boolean>} ユーザーが情報を入力し、データが正常に追加された場合はtrue、キャンセルされた場合はfalseを解決するPromise。
 */
async function handleShapeCreated(layer: LeafletLayer): Promise<boolean> {
    const bounds = layer.getBounds();

    // 描画された領域が左上に表示されるようにマップを調整
    const zoom = map.getBoundsZoom(bounds, false); // パディングなしでズームレベルを取得
    const nw = bounds.getNorthWest(); // 領域の北西（左上）の角を取得

    // 領域の左上の角をマップビューの左上に合わせるための中心点を計算

    const nwPixel = map.project(nw, zoom);
    const mapSize = map.getSize();
    const centerPixel = nwPixel.add(mapSize.divideBy(2));
    const newCenter = map.unproject(centerPixel, zoom);

    // 新しい中心とズームレベルを一度に設定
    map.setView(newCenter, zoom, { animate: true });

    // drawerComponent.open()
    modal.appear(newCenter.lat, newCenter.lng);
    const info = await showInfoModal();
    modal.close();


    if (info && 'era' in info) {
        const eraParts = (info.era as string).split('-');
        if (eraParts.length !== 2) {
            alert(
                "時代の入力形式が正しくありません。例: '1980-1990' のように入力してください。",
            );
            return false;
        }

        const gt = parseInt(eraParts[0], 10);
        const lte = parseInt(eraParts[1], 10);

        if (Number.isNaN(gt) || Number.isNaN(lte)) {
            alert(
                "時代の入力形式が正しくありません。例: '1980-1990' のように入力してください。",
            );
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
                allPosts.push(submission); // ★ 新しく追加したデータもallPostsに追加

                const postLayer = map.addInfoBox(submission);
                // 領域クリック時のイベントリスナーを追加
                const respJson = await response.json();
                postLayer.on('click', (e) => {
                    getComments(respJson["id"]); //テスト用にGETリクエスト
                });

                return true;
            } else {
                console.error('Failed to save data', await response.text());
                alert('データの保存に失敗しました。');
                return false;
            }
        } catch (error) {
            console.error('Error posting data', error);
            alert('データの送信中にエラーが発生しました。');
            return false;
        }
    }
    return false;
}

/**
 * ★ 3. 指定された年代の範囲に基づいて地図上のマーカーをフィルタリングします。
 * @param {number} startYear - フィルタリング範囲の開始年。
 * @param {number} endYear - フィルタリング範囲の終了年。
 */
export function filterMapByDecade(startYear: number, endYear: number): void {
    if (!allPosts) return;

    map.markerLayer.clearLayers();

    const filteredPosts = allPosts.filter(post => {
        const postStart = post.decade.gt;
        const postEnd = post.decade.lte;
        return postEnd >= startYear && postStart <= endYear;
    });

    filteredPosts.forEach(post => {
        map.addInfoBox(post);
    });

    console.log(`Filtered to ${filteredPosts.length} posts between ${startYear} and ${endYear}.`);
}


// ================== 初期化処理 ==================
/** Leafletマップのインスタンス。 */
export const map: LeafletMap = initMap('map', handleShapeCreated);

// マップの移動範囲を全世界に制限
const worldBounds = L.latLngBounds(
    L.latLng(-90, -180), // 南西の角
    L.latLng(90, 180), // 北東の角
);
map.setMaxBounds(worldBounds);

map.setView([35.943, 136.188], 15);

// 初期データを一度だけ、全範囲で読み込む
loadAndRenderData();

// ================== カスタム描画コントロール ==================

const drawPolygonButton = document.getElementById(
    'draw-polygon',
) as HTMLButtonElement;

const polygonDrawer = new L.Draw.Polygon(map);

drawPolygonButton.addEventListener('click', () => polygonDrawer.enable());