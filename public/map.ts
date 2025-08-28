/**
 * @file マップアプリケーションのクライアントサイドの主要なロジックを実装します。
 * これには、マップの初期化、ユーザーインタラクションの処理、サーバーとのデータ同期などが含まれます。
 */

'use strict';

import {initMap} from "./map-initializer.ts";
import {MapDataInfo} from "../types/map.ts";
import {LeafletGlobal, LeafletLayer, LeafletMap} from "../types/leaflet.ts";
import {postJson, queryJson} from "../utils/api.ts";
import {PostSubmission} from "../types/postData.ts";

// Leaflet.jsから提供されるグローバルなLオブジェクト。
declare const L: LeafletGlobal;
const drawPolygonButton = document.getElementById(
    'draw-polygon',
) as HTMLButtonElement;


// ================== DOM要素取得 ==================

/** ユーザーインターフェースのモーダルウィンドウ要素。 */
const postForm = document.getElementById('infoModal') as HTMLElement & {
	clear: () => void;
	open: () => void;
	close: () => void;
};

// ================== 関数定義 ==================

/**
 * サーバーから地図データを非同期で読み込み、マップを再描画します。
 */
async function loadAndRenderData(): Promise<void> {
    try {
        const posts = await queryJson({ year: -1, x: -180, y: -90, x2: 180, y2: 90 });
        map.markerLayer.clearLayers();
        posts.forEach(post => {
            const layer = map.addInfoBox(post);
            layer.on('click', () => {
                const event = new CustomEvent('show-comments', {
                    detail: { post },
                    bubbles: true,
                    composed: true
                });
                window.dispatchEvent(event);
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
	drawPolygonButton.disabled = true;
	postForm.clear();
    postForm.open();

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
			postForm.removeEventListener('submit', onSubmit);
			postForm.removeEventListener('cancel', onCancel);
            postForm.close();
            drawPolygonButton.disabled = false;
		};

		postForm.addEventListener('submit', onSubmit, { once: true });
		postForm.addEventListener('cancel', onCancel, { once: true });
	});
}

/**
 * ユーザーがマップ上に新しい図形を描画した際の処理を行います。
 * @param {LeafletLayer} layer - 描画された図形レイヤー。
 * @returns {Promise<boolean>} ユーザーが情報を入力し、データが正常に追加された場合はtrue、キャンセルされた場合はfalseを解決するPromise。
 */
async function handleShapeCreated(layer: LeafletLayer): Promise<boolean> {
    const bounds = layer.getBounds();
    const zoom = map.getBoundsZoom(bounds, false);
    const nw = bounds.getNorthWest();

	const nwPixel = map.project(nw, zoom);
	const mapSize = map.getSize();
	const padding = L.point(40, 40);
	const centerPixel = nwPixel.subtract(padding).add(mapSize.divideBy(2));
	const newCenter = map.unproject(centerPixel, zoom);

    map.setView(newCenter, zoom, { animate: true });

	const info = await showInfoModal();

    if (info && 'era' in info) {
        const eraParts = (info.era as string).split('-');
        if (eraParts.length !== 1 && eraParts.length !== 2) {
            alert("時代の入力形式が正しくありません。");
            return false;
        }

        const gt = parseInt(eraParts[0], 10);
        const lte = eraParts.length === 2 ? parseInt(eraParts[1], 10) : gt;

        if (Number.isNaN(gt) || Number.isNaN(lte)) {
            alert("時代の入力形式が正しくありません。");
            return false;
        }

        const submission: Omit<PostSubmission, 'id'> = {
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
                const newPost: PostSubmission = await response.json();
                const postLayer = map.addInfoBox(newPost);
                postLayer.on('click', () => {
                    const event = new CustomEvent('show-comments', {
                        detail: { post: newPost },
                        bubbles: true,
                        composed: true
                    });
                    window.dispatchEvent(event);
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

// ================== 初期化処理 ==================
/** Leafletマップのインスタンス。 */
export const map: LeafletMap = initMap('map', handleShapeCreated);

const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
map.setMaxBounds(worldBounds);

map.setView([35.943, 136.188], 15);

map.on('moveend', () => {
    const bounds = map.getBounds();
    const event = new CustomEvent('map-bounds-changed', {
        detail: { bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        } }
    });
    window.dispatchEvent(event);
});

loadAndRenderData();

const polygonDrawer = new L.Draw.Polygon(map);
drawPolygonButton.addEventListener('click', () => polygonDrawer.enable());
