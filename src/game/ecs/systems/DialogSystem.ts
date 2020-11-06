import { Game } from "../../..";
import { Point } from "../../../utilities/Trig";

export function render(lines: Array<string>, game: Game, context: CanvasRenderingContext2D) {
    var image = game.images.get("dialog");
    context.drawImage(image, 5, 5);
    var height = 30;
    lines.forEach(text => { 
        game.fonts.small.render(context, new Point(30, height), text);
        height += 15;
    })
}