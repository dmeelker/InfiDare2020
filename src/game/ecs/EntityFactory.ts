import { Game } from "../..";
import { Point, Rectangle } from "../../utilities/Trig";
import { DimensionsComponent } from "./components/DimensionsComponent";
import { RenderComponent, StaticImageProvider } from "./components/RenderComponent";
import { EntityId } from "./EntityComponentSystem";

export function createPlayer(game: Game, location: Point,): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("player");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x, location.y, 12, 16));
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));

    return entityId;
}
