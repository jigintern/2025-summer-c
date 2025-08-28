// filter.ts

// filter.ts

import { PostSubmission } from "../types/postData.ts";
import { LeafletMap } from "../types/leaflet.ts";

/**
 * 指定された年代の範囲に基づいて地図上のマーカーをフィルタリングします。
 */
// ★ export をつけて、他のファイルから呼び出せるようにする
export function filterMapByDecade(
    map: LeafletMap,
    allPosts: PostSubmission[],
    startYear: number,
    endYear: number
): void {
    if (!allPosts || !map) return;
    map.markerLayer.clearLayers();
    const filteredPosts = allPosts.filter(post => {
        const postStart = post.decade.gt;
        const postEnd = post.decade.lte;
        return postEnd >= startYear && postStart <= endYear;
    });
    filteredPosts.forEach(post => map.addInfoBox(post));
    console.log(`Filtered to ${filteredPosts.length} posts between ${startYear} and ${endYear}.`);
}

// ==========================================================
// ★★★ イベント設定部分 (ここからが新しい司令塔の役割) ★★★
// ==========================================================

// DOM要素をページ全体から検索
const slider = document.querySelector('slider-component');
const resultDisplay = document.querySelector<HTMLSpanElement>('#result');

// 要素が見つかった場合のみイベントリスナーを設定
if (slider && resultDisplay) {
    slider.addEventListener('rangeChange', (event: Event) => {
        const customEvent = event as CustomEvent<{ range: [number, number] }>;
        const [startYear, endYear] = customEvent.detail.range;

        // このファイル内にあるフィルター関数を呼び出す
        filterMapByDecade(map, allPosts, startYear, endYear);

        // 画面の表示を更新
        resultDisplay.textContent = `${startYear}年 〜 ${endYear}年`;
    });
} else {
    console.error('スライダーまたは結果表示用の要素がページに見つかりません。');
}