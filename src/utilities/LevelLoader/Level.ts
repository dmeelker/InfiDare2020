import {Layer, TiledLevel} from "./TiledLevel";
import {TileSet} from "./TileSet";


export class Level {
  levels_folder = '/levels/'
  private TiledLevel: TiledLevel;
  private TileSet: TileSet[] = [];
  private TileIdArray: Uint32Array;

  constructor(private canvas: HTMLCanvasElement) {

  }

  public async loadLevel(levelToLoad: string) {
    // get the file
    this.TiledLevel = await fetch(this.levels_folder + levelToLoad)
      .then(l => l.json())

    // search the tsx tilesets
    await this.parseTileSets();
    // read base64 level array
    this.parseDataForLayer();
    // draw all the tiles to screen
    this.drawMap();
    // bonus: apply the layers in order

    // bonus: set collision rects

  }

  private drawMap() {
    for (let i = 0; i < this.TileIdArray.length; i++) {
      let tileId = this.TileIdArray[i];
      let x = i % this.TiledLevel.width;
      let y = Math.floor(i / this.TiledLevel.height);

      // GetTileSet
      const set = this.TileSet.find(t => tileId >= t.first_gid);
      let xOnSheet = (tileId - set.first_gid) % set.columns;
      let yOnSheet = Math.floor((tileId - set.first_gid) / (set.tilecount / set.columns))

      this.canvas.getContext("2d")
        .drawImage(set.image_tag, xOnSheet, yOnSheet, set.source_width, set.source_height,
          x, y, this.TiledLevel.tilewidth, this.TiledLevel.tileheight);
    }
  }

  private async parseTileSets(): Promise<void> {
    let convert = require('xml-js');

    for (let i = 0; i < this.TiledLevel.tilesets.length; i++) {
      const ts = this.TiledLevel.tilesets[i];

      const jsonXml = await fetch(this.levels_folder + ts.source)
        .then(d => d.text())
        .then(t => convert.xml2json(t, {compact: true, spaces: 4}));

      await this.buildTileSetFromXml(jsonXml, ts.firstgid)
        .then(t => this.TileSet.push(t))
        .then(() => this.TileSet.sort((t, o) => t.first_gid - o.first_gid)); // do *NOT* remove!
    }
  }

  private parseDataForLayer() {
    if (!this.TiledLevel) {
      throw "no level loaded joh!";
    }

    let raw = window.atob(this.TiledLevel.layers[0].data);
    var array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    this.TileIdArray = new Uint32Array(array.buffer);
  }

  private async buildTileSetFromXml(tileSetString: string, first_gid: number): Promise<TileSet> {
    let tileSetObject = JSON.parse(tileSetString);
    let image = new Image();
    image.src = 'levels/' + tileSetObject.tileset.image._attributes.source;

    let tileSet: TileSet = {
      name: tileSetObject.tileset._attributes.name,
      source: '/levels/' + tileSetObject.tileset.image._attributes.source,
      source_height: tileSetObject.tileset.image._attributes.height,
      source_width: tileSetObject.tileset.image._attributes.width,
      tilecount: tileSetObject.tileset._attributes.tilecount,
      tileheight: tileSetObject.tileset._attributes.tileheight,
      tilewidth: tileSetObject.tileset._attributes.tilewidth,
      columns: tileSetObject.tileset._attributes.columns,
      first_gid: first_gid,
      image_tag: image,
    }
    image.addEventListener('load', async () => {
      console.log('Loaded ' + image.src);
      tileSet.image = await window.createImageBitmap(image);
    }, false);

    return tileSet;
  }
}
