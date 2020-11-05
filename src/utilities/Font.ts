import { Point, Size } from "./Trig";

export interface FontDefinition {
    LineHeight: number;
    Base: number;
    Characters: Array<Character>;
}

interface Character {
    Char: number;
    X: number;
    Y: number;
    Width: number;
    Height: number;
    XOffset: number;
    YOffset: number;
    XAdvance: number;
}

export class Font {
    public LineHeight: number;
    public Base: number;
    public Characters: Map<string, Character>;
    public Image: ImageBitmap;

    public render(context: CanvasRenderingContext2D, location: Point, text: string) {
        
        for(let charIndex=0; charIndex<text.length; charIndex++) {
            let stringChar = text.charAt(charIndex);
            let fontChar = this.Characters.get(stringChar);
    
            if(fontChar == undefined) {
                continue;
            }
    
            context.drawImage(this.Image, fontChar.X, fontChar.Y, fontChar.Width, fontChar.Height, location.x + fontChar.XOffset, location.y + fontChar.YOffset, fontChar.Width, fontChar.Height);
    
            location = location.add(new Point(fontChar.XAdvance, 0));
        }
    }

    public calculateSize(text: string): Size {
        let size = {width: 0, height: this.LineHeight};

        for(let charIndex=0; charIndex<text.length; charIndex++) {
            let stringChar = text.charAt(charIndex);
            let fontChar = this.Characters.get(stringChar);
    
            if(fontChar == undefined) {
                continue;
            }
    
            size.width += fontChar.XAdvance;
        }

        return size;
    }
}

export function prepareFont(definition: FontDefinition, image: ImageBitmap): Font {
    let font = new Font();
    font.LineHeight = definition.LineHeight;
    font.Base = definition.Base;
    font.Characters = new Map(definition.Characters.map(chr => [String.fromCharCode(chr.Char), chr]));
    font.Image = image;

    return font;
}
