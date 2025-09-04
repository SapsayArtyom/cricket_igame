import { Container, Sprite } from "pixi.js";
import BaseScreen from "./BaseScreen.ts";
import { config } from "../configs/config";

export default class HowToPlayScreen extends BaseScreen {
    private sideBarContainer: Container;
    private bottomBarContainer: Container;

    constructor() {
        super();

        this.sideBarContainer = new Container();
        this.bottomBarContainer = new Container();

        this.init();
        this.addSideBar();
        this.addBottomBar();
    }

    private init() {
        const bg = Sprite.from('gradient');
        bg.width = config.appWidth;
        bg.height = config.appHeight;
        this.addChild(bg);
    }

    private addSideBar() {
        this.addChild(this.sideBarContainer);
    }
	
    private addBottomBar() {
        this.addChild(this.bottomBarContainer);
    }
}	
