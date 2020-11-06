
export interface TileSet {
  name: string;
  tilewidth: number,
  tileheight: number,
  tilecount: number,
  columns: number,
  source: string,
  source_width: number,
  source_height: number,
  image?: ImageBitmap,
  first_gid:number,
  image_tag: HTMLImageElement,
}
