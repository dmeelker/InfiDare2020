import { Game } from "../../..";
import { Point, Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { EnemyComponent, EnemyState } from "../components/EnemyComponent";
import { LivingComponent } from "../components/LivingComponent";
import { EntityId } from "../EntityComponentSystem";
import * as CarrierHelper from "./../utilities/CarrierHelper"

const SPEED: number = 40;

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
    const speed = enemy.state == EnemyState.MovingToPos ? SPEED + 15 : SPEED;
    const velocity = targetLocation.subtract(enemyDimensions.centerLocation).toUnit()
        .multiplyScalar(game.time.calculateMovement(speed));

    const collisionEntity = collides(game.state, enemyDimensions.entityId, velocity);
    if (!collisionEntity) {
        enemyDimensions.move(velocity);
    } else {
        const livingComponent = collisionEntity as LivingComponent;
        if (livingComponent) {
            livingComponent.hp -= 1;
            if (livingComponent.hp <= 0) {
                game.state.ecs.disposeEntity(livingComponent.entityId);
            }
        }

        enemy.targetId = null;
        enemy.targetPos = enemyDimensions.centerLocation.add(new Vector(40 - 80 * Math.random(), 40 - 80 * Math.random()))
        enemy.state = EnemyState.MovingToPos;
    }
}

export function collides(state: GameState, id: EntityId, velocity: Vector): DimensionsComponent | undefined {
    const mover = state.ecs.components.dimensionsComponents.get(id);
    const targetBounds = mover.bounds.translate(velocity);
    for (var component of state.ecs.components.dimensionsComponents.all) {
        if (component.hasCollision && component.bounds.overlaps(targetBounds) && component.entityId != mover.entityId) {
            return component;
        }
    }

    return undefined;
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
