// MIT License
// 
// Copyright (c) 2019 Taisuke Fukuno
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// https://code4fukui.github.io/egmapjs/egmap.js


// @deno-types="npm:@types/leaflet" // Denoに対して、Leafletの型定義ファイルを指定します
import L from 'npm:leaflet';

// L.Mapを拡張して、iconLayerとaddIconメソッドを持つ新しいインターフェースを定義します
export interface MapWithIconLayer extends L.Map {
    iconLayer: L.LayerGroup; // アイコンをまとめるためのレイヤーグループ
    addIcon: ( // マップにアイコンを追加するためのメソッド
        lat: number, // アイコンの緯度
        lng: number, // アイコンの経度
        nameOrParam: { // アイコンの名前やコールバック関数を含むオブジェクト、または名前の文字列、またはコールバック関数. stringならばそれが表示されるだけだが, 関数ならクリック時に実行される.
            name?: string; // アイコンの名前（ポップアップに表示される）
            callback?: ((e: L.LeafletMouseEvent, name?: string) => void); // アイコンクリック時に実行されるコールバック関数
        } | string | ((e: L.LeafletMouseEvent, name?: string) => void),
        iconUrl?: string, // アイコン画像のURL（オプション）
        iconWidth?: number, // アイコンの幅（オプション）
        iconHeight?: number, // アイコンの高さ（オプション）
    ) => L.Marker; // 追加されたマーカーオブジェクトを返す
}

// 指定されたIDのHTML要素にマップを埋め込む関数
export const initMap = (mapid: string): MapWithIconLayer => {
    const map = L.map(mapid) as MapWithIconLayer; // 指定されたIDの要素にLeafletマップオブジェクトを生成

    // OpenStreetMapから地図タイルを取得し、マップレイヤーとして追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // 地図の著作権情報を設定します
        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    }).addTo(map); // 作成したタイルレイヤーをマップに追加

    // アイコン関連の初期設定
    map.iconLayer = L.layerGroup();  // アイコン用のレイヤーグループを生成
    map.iconLayer.addTo(map);  // 生成したレイヤーをマップに追加
    map.addIcon = (  // mapオブジェクトにaddIconメソッドを追加
        lat, // 緯度
        lng, // 経度
        nameOrParam, // 名前またはパラメータオブジェクト
        iconUrl, // アイコン画像のURL
        iconWidth, // アイコンの幅
        iconHeight, // アイコンの高さ
    ) => {
        // アイコンの名前について
        let name = null; // アイコンの名前を格納する変数
        // nameOrParamが文字列の場合、それを名前に設定
        if (typeof nameOrParam == "string") {
            name = nameOrParam;
        // nameOrParamがオブジェクトで、nameプロパティを持つ場合、その値を名前に設定
        } else if (typeof nameOrParam == "object" && nameOrParam.name) {
            name = nameOrParam.name;
        }
        
        let marker; // マーカーオブジェクトを格納する変数
        // アイコンURLが指定されている場合
        if (iconUrl) {
            // アイコンの幅が指定されていなければデフォルトで32に設定
            if (!iconWidth) {
                iconWidth = 32;
            }
            // Leafletのiconオブジェクトをカスタム設定で生成
            const icon = L.icon({
                iconUrl: iconUrl, // アイコン画像のURL
                iconSize: [iconWidth, iconHeight ?? iconWidth], // アイコンのサイズ。高さがなければ幅と同じ値を使
                iconAnchor: [iconWidth / 2,  iconHeight ?? iconWidth / 2], // アイコンのアンカー位置（画像の中心）
            });
            // カスタムアイコンを使用してマーカーを生成
            marker = L.marker([lat, lng], {
                title: name?? undefined, // マーカーのタイトル（マウスホバーで表示）
                icon: icon, // 上で作ったカスタムアイコン
            });
        } else {
            // アイコンURLが指定されていない場合、デフォルトのマーカーを生成します
            marker = L.marker([lat, lng], { title: name ?? undefined });
        }
        
        // nameOrParamが関数の場合、それをクリックイベントのハンドラとして設定. 
        if (typeof nameOrParam == "function") {
            marker.on("click", function (e) {
                // クリック時に指定されたコールバック関数を実行します
                nameOrParam(e, name ?? undefined);
            });
        } else {
            // それ以外の場合、マーカーにポップアップをバインドします
            marker.bindPopup(
                "<h2>" + name + "</h2>", // ポップアップに表示するHTMLコンテンツ
                {
                    maxWidth: 500, // ポップアップの最大幅
                },
            );
            // マーカーのクリックイベントにリスナーを追加します
            marker.on("click", function (e) {
                // nameOrParamがコールバックを持つオブジェクトの場合、そのコールバックを実行します
                if (nameOrParam && typeof nameOrParam === "object" && nameOrParam.callback) {
                    nameOrParam.callback(e, name ?? undefined);
                }
            });
        }
        
        // 生成したマーカーをアイコンレイヤーに追加
        map.iconLayer.addLayer(marker);
        // 生成したマーカーオブジェクトを返す
        return marker;
    };
    // 初期化およびカスタマイズされたmapオブジェクトを返します
    return map;
};