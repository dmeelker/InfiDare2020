import { Game } from "../../..";
import { chance, randomInt } from "../../../utilities/Random";
import { Point, Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { BarrierComponent } from "../components/BarrierComponent";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { EnemyBehaviour, EnemyComponent, EnemyState } from "../components/EnemyComponent";
import { LivingComponent } from "../components/LivingComponent";
import { EntityId } from "../EntityComponentSystem";
import { createEnemy } from "../EntityFactory";
import * as CarrierHelper from "./../utilities/CarrierHelper"

const SPEED: number = 40;

export function update(game: Game) {
    const enemies = game.state.ecs.components.enemyComponents.all;

    for (let enemy of enemies) {
        switch (enemy.behaviour) {
            case EnemyBehaviour.Normal:
                executeNormalBehaviour(game, enemy);
                break;
            case EnemyBehaviour.Spawner:
                executeSpawnBehaviour(game, enemy);
                break;
            case EnemyBehaviour.Ram:
                executeRamBehaviour(game, enemy);
                break;
        }
    }
}

function executeNormalBehaviour(game: Game, enemy: EnemyComponent) {
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
                moveTowardsTarget(game, enemy, enemyDimensions, new Point(game.view.size.width + 100, game.view.size.height / 2));
            } else {
                if (!enemy.targetId || !targetVisible(game, enemy.targetId)) {
                    enemy.targetId = findClosestTarget(game, enemyDimensions.centerLocation);

                    if (!enemy.targetId) {
                        return;
                    }
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

function executeRamBehaviour(game: Game, enemy: EnemyComponent) {
    const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId) as LivingComponent;

    if (!enemy.targetId || !targetVisible(game, enemy.targetId)) {
        enemy.targetId = findClosestBarrier(game, enemyDimensions.centerLocation);

        if (!enemy.targetId) {
            enemy.behaviour = EnemyBehaviour.Normal;
            return;
        }
    }

    const targetLocation = game.state.ecs.components.dimensionsComponents.get(enemy.targetId).centerLocation;
    moveTowardsTarget(game, enemy, enemyDimensions, targetLocation);
}

function executeSpawnBehaviour(game: Game, enemy: EnemyComponent) {
    const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId) as LivingComponent;

    if (chance(0.5)) {
        createEnemy(game, new Point(
            enemyDimensions.centerLocation.x + randomInt(-20, 20),
            enemyDimensions.centerLocation.y + randomInt(-20, 20)));
    }
}

function moveTowardsTarget(game: Game, enemy: EnemyComponent, enemyDimensions: DimensionsComponent, targetLocation: Point) {
    const speed = enemy.getSpeed();
    const velocity = targetLocation.subtract(enemyDimensions.centerLocation).toUnit()
        .multiplyScalar(game.time.calculateMovement(speed));

    const collisionEntity = collides(game.state, enemyDimensions.entityId, velocity);
    if (!collisionEntity) {
        enemyDimensions.move(velocity);
    } else {
        if(collisionEntity.isDestroyable) {
            collisionEntity.hitpoints -= enemy.ramForce;
            if (collisionEntity.hitpoints <= 0) {
                game.state.ecs.disposeEntity(collisionEntity.entityId);
            }
        }

        enemy.targetId = null;
        enemy.targetPos = enemyDimensions.centerLocation.add(new Vector(40 - 80 * Math.random(), 40 - 80 * Math.random()))
        enemy.state = EnemyState.MovingToPos;
    }
}

export function collides(state: GameState, id: EntityId, velocity: Vector): BarrierComponent | undefined {
    const mover = state.ecs.components.dimensionsComponents.get(id);
    const moverBounds = mover.bounds.translate(velocity);

    for (var barrier of state.ecs.components.barrierComponents.all) {
        const barrierDimensions = state.ecs.components.dimensionsComponents.get(barrier.entityId);

        if (barrierDimensions.bounds.overlaps(moverBounds) && barrierDimensions.entityId != mover.entityId) {
            return barrier;
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

function findClosestBarrier(game: Game, ownLocation: Point): EntityId {
    const allTargets = game.state.ecs.components.barrierComponents.all;
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
