import { Container } from "pixi.js";
import { EVENTS, SCREENS } from "../helpers/events";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import BaseScreen from "../screens/BaseScreen";
import SplashScreen from "../screens/SplashScreen";
import HowToPlayScreen from "../screens/HowToPlayScreen";
import GameScreen from "../screens/GameScreen";

export default class SceneManager {
    private gameContainer: Container;
    private isInitScenes: boolean;
    private screens: Map<string, BaseScreen> = new Map();
    private currentScreen: string | null = null;

    constructor(container: Container) {
        this.gameContainer = container;
        this.isInitScenes = false;
        this.subscribeToEvents();
        this.initSplashScreen();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.OPEN_SCREEN, (screen: string) => this.changeScreen(screen));
        globalEventEmitter.on(EVENTS.CREATE_GAME, () => this.init());
    }

    private initSplashScreen(): void {
        const splashScreen = new SplashScreen();
        this.screens.set(SCREENS.SPLASH, splashScreen);
    }
    
    public init(): void {
        if (this.isInitScenes) return;
        
        const howToPlayScreen = new HowToPlayScreen();
        this.screens.set(SCREENS.HOW_TO_PLAY, howToPlayScreen);
        const gameScreen = new GameScreen();
        this.screens.set(SCREENS.GAME, gameScreen);

        this.screens.forEach((screen) => {
            screen.visible = false;
            // screen.position.set(config.appWidth / 2, config.appHeight / 2);
            this.gameContainer.addChild(screen);
        });
        this.isInitScenes = true;
    }

    public changeScreen(screenName: string): void {
        if (!this.screens.has(screenName)) {
            console.error(`Screen "${screenName}" does not exist.`);
            return;
        }

        if (this.currentScreen && this.screens.has(this.currentScreen)) {
            const currentScreen = this.screens.get(this.currentScreen)!;
            currentScreen.hide();
        }

        const newScreen = this.screens.get(screenName)!;
        newScreen.show();

        this.currentScreen = screenName;
    }

    public getScreen(name: string): SplashScreen {
        return this.screens.get(name)! as SplashScreen;
    }
}