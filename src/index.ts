import { Images } from "./utilities/Images";
import { FrameCounter } from "./utilities/FrameCounter";
import PixelFontSmall from "./fonts/PixelFontSmall"
import PixelFontMedium from "./fonts/PixelFontMedium"
import { Point, Rectangle } from "./utilities/Trig";
import { FrameTime } from "./utilities/FrameTime";
import { SpriteSheetLoader } from "./utilities/SpriteSheetLoader";
import { AnimationDefinition, AnimationRepository } from "./utilities/Animation";
import { Font, prepareFont } from "./utilities/Font";
import { ScreenManager } from "./utilities/ScreenManager";
import { IntroScreen } from "./IntroScreen";
import { PlayScreen } from "./PlayScreen";
import { GameState } from "./game/GameState";
import { Keyboard } from "./utilities/Keyboard";
import { InputProvider, Keys } from "./utilities/InputProvider";
import { GamepadPoller } from "./utilities/GamepadPoller";
import { Mouse } from "./utilities/Mouse";
import { MessageBus } from "./Events/MessageBus";
import { Level } from "./utilities/LevelLoader/Level";

export class ViewInfo {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public size: Rectangle;
    public scale: number = 2;

    public levelToScreenCoordinates(levelCoordinates: Point): Point {
        return new Point(
            this.size.width * (levelCoordinates.x / 100),
            this.size.height * (levelCoordinates.y / 100))
    }
}

export class Fonts {
    public small: Font;
    public medium: Font;
}

export class Game {
    private _time = new FrameTime(0, 0);

    public get time(): FrameTime {
        return this._time;
    }

    public readonly view = new ViewInfo();
    public readonly images = new Images();
    public readonly animations = new AnimationRepository();
    public readonly fonts = new Fonts();
    public mouse: Mouse;
    public readonly keyboard = new Keyboard();
    public readonly gamepadPoller = new GamepadPoller();
    public readonly input = new InputProvider(this.keyboard, this.gamepadPoller);
    public readonly messageBus = new MessageBus();

    public level: Level;

    public introScreen: IntroScreen;
    public playScreen: PlayScreen;
    public screenManager: ScreenManager;

    public readonly state = new GameState();

    private readonly _frameCounter = new FrameCounter();
    private _lastFrameTime = 0;

    public async start() {
        await this.initialize();
        this.requestAnimationFrame();
    }

    private async initialize() {
        this.setupView();
        this.mouse = new Mouse(this.view.canvas, this.view.scale);
        await this.loadImages();
        this.level = new Level(this.view.canvas);
        await this.level.loadLevel('level02.json');
        this.setupAnimations();
        this.loadFonts();
        this.intializeScreens();
        this.initializeKeyBindings();


    }

    private setupView() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.style.width = (canvas.width * this.view.scale) + "px";
        canvas.style.height = (canvas.height * this.view.scale) + "px";
        canvas.style.imageRendering = "pixelated";

        this.view.canvas = canvas;
        this.view.context = canvas.getContext("2d");
        this.view.size = new Rectangle(0, 0, canvas.width, canvas.height);
    }

    private async loadImages() {
        await this.images.load("playerup", "gfx/heroup.png");
        await this.images.load("playerdown", "gfx/herodown.png");
        await this.images.load("playerright", "gfx/heroright.png");
        await this.images.load("playerleft", "gfx/heroleft.png");
        await this.images.load("zombie0", "gfx/zombie0.png");
        await this.images.load("zombie1", "gfx/zombie1.png");
        await this.images.load("zombie2", "gfx/zombie2.png");
        await this.images.load("ramzombie", "gfx/ramzombie.png");
        await this.images.load("boss", "gfx/eindbaas.png");
        await this.images.load("floor1", "gfx/floor1.png");
        await this.images.load("box", "gfx/box.png");
        await this.images.load("apple", "gfx/apple.png");
        await this.images.load("beercan", "gfx/beercan.png");
        await this.images.load("ducky", "gfx/ducky.png");
        await this.images.load("banana", "gfx/banana.png");
        await this.images.load("toiletpaper", "gfx/tp.png");
        await this.images.load("chicken", "gfx/chicken.png");
        await this.images.load("shoppingcart", "gfx/cart.png");
        await this.images.load("pixelfont-small", "gfx/pixelfont-small.png");
        await this.images.load("pixelfont-medium", "gfx/pixelfont-medium.png");
        await this.images.load("dialog", "gfx/dialog.png");
        await this.images.load("shadow", "gfx/shadow.png");
    }

    private async setupAnimations() {
        //await this.createAnimationFromImage("explosion", 6, 1, 50);
    }

    private async createAnimationFromImage(code: string, horizontalSprites: number, verticalSprites: number, animationSpeed: number) {
        const image = this.images.get(code);
        const frames = await new SpriteSheetLoader().cutSpriteSheet(image, horizontalSprites, verticalSprites);

        this.animations.add(code, new AnimationDefinition(frames, animationSpeed));
    }

    private loadFonts() {
        this.fonts.small = prepareFont(PixelFontSmall, this.images.get("pixelfont-small"));
        this.fonts.medium = prepareFont(PixelFontMedium, this.images.get("pixelfont-medium"));
    }

    private intializeScreens() {
        var messageBus = new MessageBus();

        this.introScreen = new IntroScreen(this);
        this.playScreen = new PlayScreen(this);
        this.screenManager = new ScreenManager(this.playScreen);
    }

    private initializeKeyBindings() {
        this.input.addKeyboardBinding(Keys.MoveUp, "KeyW");
        this.input.addKeyboardBinding(Keys.MoveDown, "KeyS");
        this.input.addKeyboardBinding(Keys.MoveLeft, "KeyA");
        this.input.addKeyboardBinding(Keys.MoveRight, "KeyD");
        this.input.addKeyboardBinding(Keys.Fire, "Space");
        this.input.addKeyboardBinding(Keys.Pause, "KeyP");
        this.input.addKeyboardBinding(Keys.Menu, "Escape");
        this.input.addKeyboardBinding(Keys.Use, "KeyE");
        this.input.addKeyboardBinding(Keys.Sprint, "ShiftLeft");

        this.input.addGamepadBinding(Keys.MoveUp, 0, 12);
        this.input.addGamepadBinding(Keys.MoveDown, 0, 13);
        this.input.addGamepadBinding(Keys.MoveLeft, 0, 14);
        this.input.addGamepadBinding(Keys.MoveRight, 0, 15);
        this.input.addGamepadBinding(Keys.Fire, 0, 1);
    }

    private requestAnimationFrame() {
        window.requestAnimationFrame(this.processFrame.bind(this));
    }

    private processFrame(time: number) {
        this._time = this.updateFrameTime(time);

        this.update(this.time);
        this.render();

        this._frameCounter.frame();
        this.requestAnimationFrame();
    }

    private updateFrameTime(time: number) {
        const frameTime = new FrameTime(time, time - this._lastFrameTime);
        this._lastFrameTime = time;

        return frameTime;
    }

    private update(time: FrameTime) {
        this.screenManager.activeScreen.update(time);
        this.keyboard.nextFrame();
        this.gamepadPoller.poll();
    }

    private render() {
        this.view.context.beginPath();
        this.view.context.fillStyle = "black";
        this.view.context.fillRect(0, 0, this.view.size.width, this.view.size.height);

        this.screenManager.activeScreen.render(this.view.context);
    }
}

new Game().start();
