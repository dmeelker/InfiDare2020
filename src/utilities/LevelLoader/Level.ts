import {Layer, TiledLevel} from "./TiledLevel";
import {TileSet} from "./TileSet";
import {EntityComponentSystem} from "../../game/ecs/EntityComponentSystem";
import {DimensionsComponent} from "../../game/ecs/components/DimensionsComponent";
import {Rectangle} from "../Trig";


export class Level {
  levels_folder = 'levels/'
  private TiledLevel: TiledLevel;
  private TileSet: TileSet[];
  private TileIdMap: Map<string, Uint32Array> = new Map<string, Uint32Array>();

  constructor(private canvas: HTMLCanvasElement) {

  }

  public async loadLevel(levelToLoad: string) {
    // get the file
    this.TiledLevel = await fetch(this.levels_folder + levelToLoad)
      .then(l => l.json())
    // search the tsx tilesets
    await this.parseTileSets();

    // read base64 level array

    this.TiledLevel.layers.forEach((layer) => {
      console.log(`loaded map, parsing layer: ${layer.name}`);
      this.parseDataForLayer(layer);
    })
  }

  public addWallsAndStatics(layerName: string, ecs: EntityComponentSystem) {
    if (!this.TileSet) {
      console.warn('TileSet isn\'t loaded yet...');
      return false;
    }
    const layer = this.TiledLevel.layers.find(l => l.name == layerName);
    if (!layer) {
      console.error(`Could not find layer with name: ${layerName}`);
      return;
    }

    this.TileIdMap.get(layer.name).forEach((tile, idx) => {
      if (tile === 0) {
        return;
      }

      let x = (idx % this.TiledLevel.width) * this.TiledLevel.tilewidth;
      let y = (Math.floor(idx / this.TiledLevel.height)) * this.TiledLevel.tileheight;

      const entityId = ecs.allocateEntityId();
      let rect = new Rectangle(x, y, this.TiledLevel.tilewidth * 0.75, this.TiledLevel.tileheight * 0.75);
      let dimensions = new DimensionsComponent(entityId, rect, true);
      ecs.components.dimensionsComponents.add(dimensions);
    });

  }

  public drawMap(canvas: CanvasRenderingContext2D): boolean {
    if (!this.TileSet) {
      console.warn('TileSet isn\'t loaded yet...');
      return false;
    }

    this.TileIdMap.forEach((tiles, name) => {
      for (let i = 0; i < tiles.length; i++) {
        const tileId = tiles[i];

        // Put Default tile here
        if (tileId === 0) {
          continue;
        }

        const x = (i % this.TiledLevel.width) * this.TiledLevel.tilewidth;
        const y = (Math.floor(i / this.TiledLevel.width)) * this.TiledLevel.tileheight;

        // GetTileSet
        const set = this.TileSet.find(t => tileId >= t.first_gid);
        if (!set) {
          console.log(this.TileSet, tileId);
          return;
        }
        const xOnSheet = (tileId - set.first_gid) % set.columns;
        const yOnSheet = Math.floor((tileId - set.first_gid) / set.columns);

        canvas
          .drawImage(
            set.image_tag,
            xOnSheet * set.tilewidth,
            yOnSheet * set.tileheight,
            set.tilewidth,
            set.tileheight,
            x, y, this.TiledLevel.tilewidth, this.TiledLevel.tileheight);
      }
    });
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

  private parseDataForLayer(layer: Layer) {
    if (!this.TiledLevel) {
      throw "no level loaded joh!";
    }

    const raw = window.atob(layer.data);
    if (!raw || raw.length < 1)
      return;
    const array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    this.TileIdMap.set(layer.name, new Uint32Array(array.buffer));
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
