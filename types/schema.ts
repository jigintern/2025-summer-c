export interface Coordinate {
    x: number;
    y: number;
    h: number;
    w: number;
    angle: number;
}

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
    coordinate: Coordinate;
    decade: Decade | null;
    content: Content;
    thread: ThreadItem[];
    created_at: string;
}
