import { Game } from "../../..";
import { Point } from "../../../utilities/Trig";

export function render(text: string, game: Game, context: CanvasRenderingContext2D) {
    var image = game.images.get("dialog");
    context.drawImage(image, 0, 0);
    game.fonts.medium.render(context, new Point(30, 30), text);
}