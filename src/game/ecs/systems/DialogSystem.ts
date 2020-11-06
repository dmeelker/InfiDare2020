import { Game } from "../../..";
import { Point } from "../../../utilities/Trig";
import { Dialog } from "../../../Scenarios/GameStart";

export function render(dialog: Dialog, game: Game, context: CanvasRenderingContext2D) {
    var image = game.images.get("dialog");
    context.drawImage(image, 5, 5);
    var height = 30;
    dialog.Sentences.forEach(text => { 
        game.fonts.small.render(context, new Point(30, height), text);
        height += 15;
    });

    game.fonts.small.render(context, new Point(25, 80), dialog.Speaker);
}