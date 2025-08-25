export interface MapDataInfo {
  posterName: string;
  era: string;
  bodyText: string;
}

export interface MapDataBounds {
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
}

export interface MapDataItem {
  bounds: MapDataBounds;
  info: MapDataInfo;
}
