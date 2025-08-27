import {GeoJSON} from "npm:@types/geojson@7946.0.16";

export interface Decade {
    lte: number;
    gt: number;
}

export interface ThreadItem {
    id: string;
    comment: string;
    created_at: string;
}

export interface Content {
    text: string;
    photos: string[];
}

export interface ItemData {
    name: string;
    geometry: GeoJSON;
    decade: Decade | null;
    content: Content;
    thread: ThreadItem[];
    created_at: string;
}
