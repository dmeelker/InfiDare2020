import {TiledLevel} from "./TiledLevel";
import {TileSet} from "./TileSet";


export class LevelLoader {

  levels_folder = '/levels/'
  private TiledLevel: TiledLevel;

  public loadLevel(levelToLoad: string) {
    // get the file
    let lvl = fetch(this.levels_folder + levelToLoad)
      .then(l => l.json())
      .then(d => this.TiledLevel = d)
      // search the tsx tilesets
      .then(() => this.parseTileSets());

    // for each search the pngs

    // read base64 level array

    // draw all the tiles to screen

    // bonus: apply the layers in order

    // bonus: set collision rects


  }

  private parseTileSets() {
    let convert = require('xml-js');

    this.TiledLevel.tilesets.forEach(ts => {
        fetch(this.levels_folder + ts.source)
          .then(d => d.text())
          .then(t => convert.xml2json(t, {compact: true, spaces: 4}))
          .then(j => this.buildTileSetFromXml(j))
      }
    );
  }

  private async buildTileSetFromXml(tileSetString: string): Promise<TileSet> {
    let tileSetObject = JSON.parse(tileSetString);
    let image = new Image();
    image.src = 'levels/' + tileSetObject.tileset.image._attributes.source;

    let img: Promise<ImageBitmap>;
    image.addEventListener('load', async () => {
      console.log('Loaded ' + image.src);
      img = window.createImageBitmap(image);
    }, false);

    return {
      name: tileSetObject.tileset._attributes.name,
      source: '/levels/' + tileSetObject.tileset.image._attributes.source,
      source_height: tileSetObject.tileset.image._attributes.height,
      source_width: tileSetObject.tileset.image._attributes.width,
      tilecount: tileSetObject.tileset._attributes.tilecount,
      tileheight: tileSetObject.tileset._attributes.tileheight,
      tilewidth: tileSetObject.tileset._attributes.tilewidth,
      columns: tileSetObject.tileset._attributes.columns,
      image: await img,
    };
  }
}
