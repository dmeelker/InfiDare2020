import { Point, Vector } from "../utilities/Trig";
import { createShip, IEnemyDescription } from "./ecs/EntityFactory";
import { MovementMode } from "./ecs/components/ComputerControlledShipComponent";
import { Timer } from "../utilities/Timer";
import { randomArrayElement, randomInt } from "../utilities/Random";
import { Game } from "..";

type WaveGenerator = (startTime: Number, game: Game) => Array<EnemySpawn>;

class EnemySpawn implements IEnemyDescription {
    public spawnTime: number;
    public location: Point;
    public vector: Vector;
    public movementMode: MovementMode;
    public path?: Point[];
}

export class EnemyGenerator {
    private _enemies = new Array<EnemySpawn>();
    private _difficulty = 0;
    private _increaseDifficultyTimer: Timer;

    constructor() {
        this.reset();
    }

    public reset() {
        this._difficulty = 0;
        this._increaseDifficultyTimer = new Timer(10000);
    }

    public update(game: Game) {
        if(this._enemies.length == 0) {
            const delayBetweenWaves = this.interpolateWithDifficulty(1000, 5000);
            const simultaneousWaveCount = Math.floor(this.interpolateWithDifficulty(5, 1));
            console.log(simultaneousWaveCount);
            const newWave = this.generateWaves(game.time.currentTime + delayBetweenWaves, game, simultaneousWaveCount);
            newWave.forEach(enemy => this._enemies.push(enemy));
        } else {
            const firstEnemy = this._enemies[0];
            if(firstEnemy.spawnTime <= game.time.currentTime) {
                this._enemies = this._enemies.splice(1);

                //console.log("Generating enemy");
                //console.log(firstEnemy);
                createShip(game, firstEnemy);
            }
        }

        if(this._increaseDifficultyTimer.update(game.time.currentTime)) {
            this._difficulty = Math.min(this._difficulty+1, 100);
            console.log(`Difficulty increased to ${this._difficulty}`);
        }
    }

    private generateWaves(startTime: number, game: Game, count: number) : Array<EnemySpawn> {
        let enemies = new Array<EnemySpawn>();

        for(let i=0; i<count; i++) {
            enemies = enemies.concat(this.generateWave(startTime, game));
        }

        return enemies.sort((a, b) => a.spawnTime - b.spawnTime);
    }

    private generateWave(startTime: number, game: Game) : Array<EnemySpawn> {
        return this.getRandomWaveGenerator()(startTime, game);
    }

    private getRandomWaveGenerator() : WaveGenerator {
        const generator = randomArrayElement([
            this.generateHorizontalLineWave, 
            this.generateDiagonalLineWave, 
            this.generateColumnWave, 
            this.generateSpreadColumnWave]);

        return generator.bind(this);
    }

    private generateHorizontalLineWave(startTime: number, game: Game) : Array<EnemySpawn> {
        const startLocation = new Point(100, randomInt(10, 90));
        const speed = this.interpolateWithDifficulty(100, 50);
        const vector = Vector.fromDegreeAngle(180).multiplyScalar(speed);

        return this.generateLineWave(startTime, game, startLocation, vector)
    }

    private generateDiagonalLineWave(startTime: number, game: Game) : Array<EnemySpawn> {
        const centerOffset = randomArrayElement([-1, 1]);
        const startLocation = new Point(100,  50 + (centerOffset * 40));
        const speed = this.interpolateWithDifficulty(100, 50);
        const vector = Vector.fromDegreeAngle(180 + (centerOffset * 16)).multiplyScalar(speed);

        return this.generateLineWave(startTime, game, startLocation, vector)
    }

    private generateLineWave(startTime: number, game: Game, startPoint: Point, vector: Vector) : Array<EnemySpawn> {
        const enemies = new Array<EnemySpawn>();
        const enemyCount = this.interpolateWithDifficulty(20, 5);

        for(let i=0; i<enemyCount; i++) {
            const enemy = new EnemySpawn();
            enemy.spawnTime = startTime + (i * this.interpolateWithDifficulty(200, 1000));
            enemy.location = game.view.levelToScreenCoordinates(startPoint);
            enemy.vector = vector;
            enemy.movementMode = MovementMode.straightLine;

            enemies.push(enemy);
        }

        return enemies;
    }

    private interpolateWithDifficulty(min: number, max: number) {
        return min + ((max - min) * ((100 - this._difficulty) / 100));
    }

    private generateColumnWave(startTime: number, game: Game) : Array<EnemySpawn> {
        const enemies = new Array<EnemySpawn>();

        for(let i=0; i<5; i++) {
            const enemy = new EnemySpawn();
            enemy.spawnTime = startTime;
            enemy.location = game.view.levelToScreenCoordinates(new Point(100, 10 + (i*20)));
            enemy.vector = Vector.fromDegreeAngle(180).multiplyScalar(50);
            enemy.movementMode = MovementMode.straightLine;

            enemies.push(enemy);
        }

        return enemies;
    }

    private generateSpreadColumnWave(startTime: number, game: Game) : Array<EnemySpawn> {
        const enemies = new Array<EnemySpawn>();

        for(let i=0; i<5; i++) {
            const enemy = new EnemySpawn();
            enemy.spawnTime = startTime + randomInt(0, 1000);
            enemy.location = game.view.levelToScreenCoordinates(new Point(100, 10 + (i*20)));
            enemy.vector = Vector.fromDegreeAngle(180).multiplyScalar(50);
            enemy.movementMode = MovementMode.straightLine;

            enemies.push(enemy);
        }

        return enemies;
    }
}