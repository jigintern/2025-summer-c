// types/photo-data.ts

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

export interface Thread {
    id: number;
    comment: string;
    created_at: string;
}

/**
 * 投稿するデータの型
 */
export interface  PostSubmission{
    name: string;
    coordinate: Coordinate;
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