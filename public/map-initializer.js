// map-initializer.js

"use strict";

export function initMap(mapid) {
	const map = L.map(mapid, {
		maxZoom: 18,
		center: [35.943, 136.188]
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // OpenStreetMapの著作権表示 (これは必須です)
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // OpenStreetMapのタイルが提供される最大ズームレベル
    maxZoom: 19, 
}).addTo(map);
	
	map.markerLayer = L.layerGroup();
	map.markerLayer.addTo(map);
	
	// (addIcon と addInfoPoint 関数はここにそのまま残します)
	// ...

	// ===============================================================
	// 3. 四角形の中に情報を表示するための新しい関数
	// ===============================================================
	map.addInfoBox = function(data) {
		// 四角形の範囲を定義 [南西の角, 北東の角]
		const bounds = [[data.lat1, data.lng1], [data.lat2, data.lng2]];

		// 半透明の四角形を作成
		const rect = L.rectangle(bounds, {
			color: "#0033ff",
			weight: 2,
			fillOpacity: 0.1
		});

		// 表示するHTMLコンテンツを作成
		const content = `
			<div class="info-box">
				<h3>投稿者: ${data.posterName}</h3>
				<p><strong>年代:</strong> ${data.era}</p>
				<p>${data.bodyText.replace(/\n/g, '<br>')}</p>
			</div>
		`;

		// ツールチップとして情報を四角形に紐付け
		rect.bindTooltip(content, {
			permanent: true,      // 常に表示
			direction: 'center',  // 中央に表示
			className: 'info-tooltip' // スタイル付けのためのCSSクラス
		});

		this.markerLayer.addLayer(rect);
		return rect;
	};
	// ===============================================================
	// 4. マップ上での領域選択機能 (Leaflet.draw)
	// ===============================================================

	// 描画された図形を保持するレイヤー
	const drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);

	// 描画コントロールをマップに追加
	const drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItems // 編集対象のレイヤー
		},
		draw: {
			polygon: false,    // ポリゴン描画は無効
			polyline: false,   // 線描画は無効
			circle: false,     // 円描画は無効
			marker: false,     // マーカー設置は無効
			circlemarker: false,
			rectangle: {       // 四角形描画の設定
				shapeOptions: {
					color: '#007bff'
				}
			}
		}
	});
	map.addControl(drawControl);

	// ユーザーが図形を描画し終えたときのイベント
	map.on(L.Draw.Event.CREATED, function (event) {
		const layer = event.layer; // 描画されたレイヤー(図形)
		const type = event.layerType;  // 描画された図形のタイプ

		if (type === 'rectangle') {
			// 描画された四角形の範囲情報を取得
			const bounds = layer.getBounds();
			const southWest = bounds.getSouthWest(); // 南西の角
			const northEast = bounds.getNorthEast(); // 北東の角

			// コンソールに座標を表示（デバッグ用）
			console.log("領域が選択されました:", {
				lat1: southWest.lat,
				lng1: southWest.lng,
				lat2: northEast.lat,
				lng2: northEast.lng,
			});

			// ★★★ ここで取得した座標を使って好きな処理を実行 ★★★
			// 例: 選択範囲に情報ボックスを表示する
			const info = prompt("投稿者名を入力してください:", "鯖江 太郎");
			if (info) {
				map.addInfoBox({
					lat1: southWest.lat, lng1: southWest.lng,
					lat2: northEast.lat, lng2: northEast.lng,
					posterName: info,
					era: '現代',
					bodyText: 'ユーザーが選択したエリアです。'
				});
				// 描画された図形をマップに追加
				drawnItems.addLayer(layer);
			}
		}
		
	});

	return map;
}


// map-initializer.js

