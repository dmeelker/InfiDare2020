import { Game } from "../../..";
import { Point, Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { EnemyComponent, EnemyState } from "../components/EnemyComponent";
import { LivingComponent } from "../components/LivingComponent";
import { EntityId } from "../EntityComponentSystem";
import * as CarrierHelper from "./../utilities/CarrierHelper"

const SPEED: number = 30;

export function update(game: Game) {
    const enemies = game.state.ecs.components.enemyComponents.all;

    for (let enemy of enemies) {
        const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId) as LivingComponent;

        switch (enemy.state) {
            case EnemyState.MovingToPos:
                if (enemy.targetPos.distanceTo(enemyDimensions.centerLocation) < 10) {
                    enemy.targetPos = null;
                    enemy.targetId = null;
                    enemy.state = EnemyState.FindingTarget;
                } else {
                    moveTowardsTarget(game, enemy, enemyDimensions, enemy.targetPos);
                }
                break;
            case EnemyState.FindingTarget:
                if (enemy.hasTP) {
                    moveTowardsTarget(game, enemy, enemyDimensions, new Point(200, 400));
                } else {
                    if (!enemy.targetId || !targetVisible(game, enemy.targetId)) {
                        enemy.targetId = findClosestTarget(game, enemyDimensions.centerLocation);
                    }

                    const targetLocation = game.state.ecs.components.dimensionsComponents.get(enemy.targetId).centerLocation;

                    if (targetReached(game, enemy, enemyDimensions)) {
                        CarrierHelper.carryObject(game, enemy.entityId, enemy.targetId);
                        enemy.hasTP = true;
                    } else {
                        moveTowardsTarget(game, enemy, enemyDimensions, targetLocation);
                    }
                    break;
                }
        }
    }
}

function moveTowardsTarget(game: Game, enemy: EnemyComponent, enemyDimensions: DimensionsComponent, targetLocation: Point) {
    const speed = enemy.state == EnemyState.MovingToPos ? SPEED + 10 : SPEED;
    const velocity = targetLocation.subtract(enemyDimensions.centerLocation).toUnit()
        .multiplyScalar(game.time.calculateMovement(speed));

    if (canMove(game.state, enemyDimensions.entityId, velocity)) {
        enemyDimensions.move(velocity);
    } else {
        enemy.targetId = null;
        enemy.targetPos = enemyDimensions.centerLocation.add(new Vector(50 - 100 * Math.random(), 50 - 100 * Math.random()))
        enemy.state = EnemyState.MovingToPos;
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

    for (let target of allTargets) {
        const targetLocation = game.state.ecs.components.dimensionsComponents.get(target.entityId).centerLocation;
        const distance = ownLocation.distanceTo(targetLocation);

        if (!nearestTarget || distance < nearestTarget.distance) {
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
