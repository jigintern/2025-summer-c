/**
 * マップ上の情報ボックスに表示される情報のデータ構造を定義します。
 */
export interface MapDataInfo {
  /** 投稿者の名前 */
  posterName: string;
  /** 関連する年代 */
  era: string;
  /** 表示される本文 */
  bodyText: string;
}

/**
 * マップ上の矩形領域の境界を定義します。
 */
export interface MapDataBounds {
  /** 南西の角の緯度 */
  lat1: number;
  /** 南西の角の経度 */
  lng1: number;
  /** 北東の角の緯度 */
  lat2: number;
  /** 北東の角の経度 */
  lng2: number;
}

/**
 * 1つのマップデータを表すアイテムの完全な構造を定義します。
 * これには、地理的な境界とそれに関連する情報が含まれます。
 */
export interface MapDataItem {
  /** 領域の境界 */
  bounds: MapDataBounds;
  /** 領域に関する情報 */
  info: MapDataInfo;
}
