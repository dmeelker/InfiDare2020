import { Game } from "../../..";
import { Point, Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { EnemyComponent, EnemyState } from "../components/EnemyComponent";
import { EntityId } from "../EntityComponentSystem";
import * as CarrierHelper from "./../utilities/CarrierHelper"

const SPEED: number = 20;

export function update(game: Game) {
    const enemies = game.state.ecs.components.enemyComponents.all;

    for (let enemy of enemies) {
        const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId);

        switch(enemy.state) {
            case EnemyState.FindingTarget:
                if(!enemy.targetId || !targetVisible(game, enemy.targetId)) {
                    enemy.targetId = findClosestTarget(game, enemyDimensions.centerLocation);
                }
        
                const targetLocation = game.state.ecs.components.dimensionsComponents.get(enemy.targetId).centerLocation;
        
                if(targetReached(game, enemy, enemyDimensions)) {
                    CarrierHelper.carryObject(game, enemy.entityId, enemy.targetId);
                    enemy.state = EnemyState.Leaving;
                } else {
                    moveTowardsTarget(game, enemyDimensions, targetLocation);
                }
                break;

            case EnemyState.Leaving:
                moveTowardsTarget(game, enemyDimensions, new Point(200, 400));
                break;
        }
    }
}

function moveTowardsTarget(game: Game, enemyDimensions: DimensionsComponent, targetLocation: Point) {
    const velocity = targetLocation.subtract(enemyDimensions.centerLocation).toUnit()
        .multiplyScalar(game.time.calculateMovement(SPEED));

    if (canMove(game.state, enemyDimensions.entityId, velocity)) {
        enemyDimensions.move(velocity);
    }
}

export function canMove(state: GameState, id: EntityId, velocity: Vector): boolean {
    const mover = state.ecs.components.dimensionsComponents.get(id);
    const targetBounds = mover.bounds.translate(velocity);
    for (var component of state.ecs.components.dimensionsComponents.all) {
        if (component.hasCollision && component.bounds.overlaps(targetBounds) && component.entityId != mover.entityId) {
            return false;
        }
    }

    return true;
}

function findClosestTarget(game: Game, ownLocation: Point): EntityId {
    const allTargets = game.state.ecs.components.enemyTargetComponents.all;
    let nearestTarget = null;

    for(let target of allTargets) {
        const targetLocation = game.state.ecs.components.dimensionsComponents.get(target.entityId).centerLocation;
        const distance = ownLocation.distanceTo(targetLocation);

        if(!nearestTarget || distance < nearestTarget.distance) {
            nearestTarget = {
                id: target.entityId,
                distance: distance
            };
        }
    }

    return nearestTarget ? nearestTarget.id : null;
}

function targetReached(game: Game, enemy: EnemyComponent, enemyDimensions: DimensionsComponent): boolean {
    const targetBounds = game.state.ecs.components.dimensionsComponents.get(enemy.targetId).bounds.addBorder(10);

    return enemyDimensions.bounds.overlaps(targetBounds);
}

function targetVisible(game: Game, targetId: EntityId): boolean {
    return game.state.ecs.components.dimensionsComponents.get(targetId) != null;
}