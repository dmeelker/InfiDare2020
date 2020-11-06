import {Layer, TiledLevel} from "./TiledLevel";
import {TileSet} from "./TileSet";


export class Level {
  levels_folder = '/levels/'
  private TiledLevel: TiledLevel;
  private TileSet: TileSet[];
  private TileIdArray: Uint32Array[] = [];

  constructor(private canvas: HTMLCanvasElement) {

  }

  public async loadLevel(levelToLoad: string) {
    // get the file
    this.TiledLevel = await fetch(this.levels_folder + levelToLoad)
      .then(l => l.json())
    // search the tsx tilesets
    await this.parseTileSets();

    // read base64 level array

    this.TiledLevel.layers.forEach((_, i) => {
      console.log(`loaded map, parsing layer: ${i}`);
      this.parseDataForLayer(i);
    })
    // draw all the tiles to screen

    let diffs = this.TileIdArray.filter((v, i, self) => self.indexOf(v) === i);

    console.log('map loaded', diffs)
  }

  public drawMap(canvas: CanvasRenderingContext2D): boolean {
    if (!this.TileSet) {
      console.warn('TileSet isn\'t loaded yet...');
      return false;
    }

    for (let idx = 0; idx < this.TileIdArray.length; idx++) {
      for (let i = 0; i < this.TileIdArray[idx].length; i++) {
        let tileId = this.TileIdArray[idx][i];

        // Put Default tile here
        if (tileId === 0) {
          continue;
        }

        let x = (i % this.TiledLevel.width) * this.TiledLevel.tilewidth;
        let y = (Math.floor(i / this.TiledLevel.height)) * this.TiledLevel.tileheight;

        // GetTileSet
        const set = this.TileSet.find(t => tileId >= t.first_gid);
        if (!set) {
          console.log(this.TileSet, tileId);
          return;
        }
        let xOnSheet = (tileId - set.first_gid) % set.columns;
        let yOnSheet = Math.floor((tileId - set.first_gid) / set.columns);

        canvas
          .drawImage(
            set.image_tag,
            xOnSheet * set.tilewidth,
            yOnSheet * set.tileheight,
            set.tilewidth,
            set.tileheight,
            x, y, this.TiledLevel.tilewidth, this.TiledLevel.tileheight);
      }
    }
    return true;
  }

  private async parseTileSets(): Promise<TileSet[]> {
    let convert = require('xml-js');
    if (!this.TileSet) {
    }
    this.TileSet = [];

    for (let i = 0; i < this.TiledLevel.tilesets.length; i++) {
      const ts = this.TiledLevel.tilesets[i];

      const jsonXml = await fetch(this.levels_folder + ts.source)
        .then(d => d.text())
        .then(t => convert.xml2json(t, {compact: true, spaces: 4}));

      const tileSet = await this.buildTileSetFromXml(jsonXml, ts.firstgid);

      this.TileSet.push(tileSet);

      //Sorting is important for draw call, see line 39
      this.TileSet.sort((t, o) => o.first_gid - t.first_gid);
    }

    return this.TileSet;
  }

  private parseDataForLayer(idx: number) {
    if (!this.TiledLevel) {
      throw "no level loaded joh!";
    }

    let raw = window.atob(this.TiledLevel.layers[idx].data);
    var array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    this.TileIdArray.push(new Uint32Array(array.buffer));
  }

  private async buildTileSetFromXml(tileSetString: string, first_gid: number): Promise<TileSet> {
    let tileSetObject = JSON.parse(tileSetString);
    let image: HTMLImageElement = new Image(tileSetObject.tileset.image._attributes.width, tileSetObject.tileset.image._attributes.height);
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
    });

    return tileSet;
  }
}
