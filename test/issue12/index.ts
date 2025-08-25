import {initMap} from "egmap";
import L from 'leaflet';

const map = initMap('mapid')
map.setZoom(16)
map.panTo([ 35.943560,136.188917 ]) // 鯖江駅
// スラッシュ2つ続けると「コメント」になる、後ろの行は何を書いてもプログラムに影響なし

// ピンを追加
map.addIcon(35.943560,136.188917, "鯖江駅")

// アイコンを追加
map.addIcon(35.944571, 136.186228 , "Hana道場", "icon/hanadojo.png", 64)

// タップしたところの緯度経度を表示
map.on("click", (e) => alert(e.latlng))

// 線分を地図上に表示する
map.addLayer(L.polyline([
    [ 35.94, 136.18 ],
    [ 35.95, 136.19 ],
    [ 35.94, 136.20 ]
], { color: 'red' }))

// 領域を地図上に表示する
map.addLayer(L.polygon([
    [ 35.941, 136.189 ],
    [ 35.942, 136.190 ],
    [ 35.941, 136.191 ]
], { color: 'green' }))

