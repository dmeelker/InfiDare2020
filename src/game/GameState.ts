import { EntityComponentSystem, EntityId } from "./ecs/EntityComponentSystem";
import { PlayerScore } from "./PlayerScore";

export class GameState {
    public readonly ecs = new EntityComponentSystem();
    public playerId: EntityId;
    public enemies: EntityId[] = [];
    public readonly score = new PlayerScore();
}
