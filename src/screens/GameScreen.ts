// import { Sprite } from 'pixi.js';
import BaseScreen from "./BaseScreen.ts";
import Controls from "../components/Controls.ts";
import Board from "../components/Board.ts";
import WinPanel from "../components/WinPanel.ts";
import BottomBar from "../components/BottomBar.ts";
import { spineCache } from '../helpers/loadSpineJSON.ts';
import { config } from "../configs/config.ts";
import LeftBar from "../components/LeftBar.ts";

export default class GameScreen extends BaseScreen {
    private board!: Board;
    private bottomBar!: BottomBar;

    constructor() {
        super();

        this.init();
        
    }

    private init() {
        const bg = spineCache.createSpine('spines', 'skeleton');
        bg.state.setAnimation(0, 'Horizontal', true);
        bg.position.set(config.appWidth / 2, config.appHeight / 2);
        this.addChild(bg);

        this.addBoard();
        this.addBetPanel();
        this.addLeftBar();
        this.addRightBar();
        this.addBottomBar();

        this.sortChildren();
    }

    private addBoard() {
        this.board = new Board();
        this.board.scale.set(0.952);
        this.board.position.set(
            (config.appWidth - this.board.width) / 2 - 20,
            -12
        );
        this.addChild(this.board);
    }

    private addBetPanel() {
        const panel = new WinPanel();
        panel.scale.set(0.955);
        panel.position.set(
            (this.board.width / 2 - panel.width / 2) + this.board.x,
            27
        );
        this.addChild(panel);	
    }

    private addRightBar() {
        const betControls = new Controls();
        betControls.position.set(
            config.appWidth - betControls.width - 25, 
            115
        );
        betControls.zIndex = 10;
        this.addChild(betControls);
    }

    private addLeftBar() {
        const leftBar = new LeftBar();
        leftBar.position.set(20, 45);
        this.addChild(leftBar);
    }
	
    private addBottomBar() {
        const bottomBar = new BottomBar();
        bottomBar.position.set(
            0,
            this.board.getBounds().bottom
        );
        this.addChild(bottomBar);
    }
}	
