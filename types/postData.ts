// types/photo-data.ts

import {GeoJSON} from "npm:@types/geojson@7946.0.16";

export interface Decade {
	lte: number;
	gt: number;
}

export interface Thread {
	id: number;
	comment: string;
	created_at: string;
}

/**
 * 投稿するデータの型
 */
export interface PostSubmission {
    id: string;
	name: string;
	geometry: GeoJSON;
	decade: Decade;
	comment: string;
	photos: string[];
	thread: Thread[];
	created_at: string;
}

/**
 * クエリ検索で利用するパラメータの型
 */
export interface QueryParams {
	year: number;
	x: number;
	y: number;
	x2: number;
	y2: number;
}
