export class SpriteSheetLoader {
    public async cutSpriteSheet(image: ImageBitmap, spritesX: number, spritesY: number) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);

        const sprites = new Array<ImageBitmap>()
        const tileSize = {width: image.width / spritesX, height: image.height / spritesY};

        for(let y=0; y<spritesY; y++) {
            for(let x=0; x<spritesX; x++) {
                const sprite = await window.createImageBitmap(canvas, x * tileSize.width, y * tileSize.height, tileSize.width, tileSize.height);
                sprites.push(sprite);
            }
        }

        return sprites;
    }
}