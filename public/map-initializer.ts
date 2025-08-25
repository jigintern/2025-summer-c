// public/map-initializer.ts

import {
  LeafletMap,
  LeafletLatLngBounds,
  LeafletGlobal,
  LeafletDrawEvent,
  LeafletRectangle,
  LeafletLayerGroup,
  LeafletControl,
  LeafletEvent
} from "../types/leaflet.ts";

// L from Leaflet.js is available globally.
declare const L: LeafletGlobal;

export function initMap(mapid: string, onShapeCreated: (bounds: LeafletLatLngBounds) => Promise<boolean>): LeafletMap {
	const map: LeafletMap = L.map(mapid, {
		maxZoom: 18,
		center: [35.943, 136.188]
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

	map.markerLayer = L.layerGroup();
	map.markerLayer.addTo(map);

	map.addInfoBox = function(data: {
    lat1: number; lng1: number; lat2: number; lng2: number;
    posterName: string; era: string; bodyText: string;
  }): LeafletRectangle {
		const bounds: [[number, number], [number, number]] = [[data.lat1, data.lng1], [data.lat2, data.lng2]];

		const rect: LeafletRectangle = L.rectangle(bounds, {
			color: "#0033ff",
			weight: 2,
			fillOpacity: 0.1
		});

		const content = `
			<div class="info-box">
				<h3>投稿者: ${data.posterName}</h3>
				<p><strong>年代:</strong> ${data.era}</p>
				<p>${data.bodyText.replace(/\n/g, '<br>')}</p>
			</div>
		`;

		rect.bindTooltip(content, {
			permanent: true,
			direction: 'center',
			className: 'info-tooltip'
		});

		this.markerLayer.addLayer(rect);
		return rect;
	};

	const drawnItems: LeafletLayerGroup = new L.FeatureGroup();
	map.addLayer(drawnItems);

	const drawControl: LeafletControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItems
		},
		draw: {
			polygon: false,
			polyline: false,
			circle: false,
			marker: false,
			circlemarker: false,
			rectangle: {
				shapeOptions: {
					color: '#007bff'
				}
			}
		}
	});
	map.addControl(drawControl);

	map.on(L.Draw.Event.CREATED, async (event: LeafletEvent) => {
        const drawEvent = event as LeafletDrawEvent;
		if (drawEvent.layerType === 'rectangle') {
            const layer = drawEvent.layer;
            // Add the layer to the drawnItems group immediately to make it visible.
            drawnItems.addLayer(layer);

			const bounds = layer.getBounds();
            // Await the result of the modal interaction.
            const success = await onShapeCreated(bounds);

            // If the user cancelled, remove the layer we just added.
            if (!success) {
                drawnItems.removeLayer(layer);
            }
		}
	});

	return map;
}
