import { Game } from "../..";
import { Point, Rectangle, Vector } from "../../utilities/Trig";
import { DimensionsComponent } from "./components/DimensionsComponent";
import { RenderComponent, StaticImageProvider } from "./components/RenderComponent";
import { ProjectileComponent } from "./components/ProjectileComponent";
import { EntityId } from "./EntityComponentSystem";

export function createDialog(game: Game, text: string, audio: String) {
    var entity = game.state.ecs.allocateEntityId();
    var image = game.images.get("dialog");
    var canvas = new HTMLCanvasElement();
    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    context.strokeText(text, 30, 30);

    var renderComponent = new RenderComponent(entity, new StaticImageProvider(canvas));
}